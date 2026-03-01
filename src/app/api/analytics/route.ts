import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

function getAuth() {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
    );
    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_ANALYTICS_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN,
    });
    return oauth2Client;
}

async function getAccessToken() {
    const auth = getAuth();
    const { token } = await auth.getAccessToken();
    return token;
}

let cachedPropertyId: string | null = null;

async function getGA4PropertyId(accessToken: string): Promise<string> {
    if (process.env.GA4_PROPERTY_ID) return process.env.GA4_PROPERTY_ID;
    if (cachedPropertyId) return cachedPropertyId;

    // Auto-discover via Admin API
    const res = await fetch(
        "https://analyticsadmin.googleapis.com/v1beta/accountSummaries",
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (res.ok) {
        const data = await res.json();
        const summaries = data.accountSummaries || [];
        for (const acc of summaries) {
            const props = acc.propertySummaries || [];
            for (const p of props) {
                // Return first property found
                const id = p.property?.replace("properties/", "") || "";
                if (id) {
                    cachedPropertyId = id;
                    console.log("Auto-discovered GA4 Property ID:", id, "Name:", p.displayName);
                    return id;
                }
            }
        }
    }
    throw new Error("GA4 Property ID bulunamadı. GA4_PROPERTY_ID env var ayarlayın.");
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "overview";
    const period = searchParams.get("period") || "28";

    try {
        if (action === "analytics") {
            const data = await getAnalyticsDataRaw(period);
            return NextResponse.json({ success: true, ...data });
        }
        if (action === "search") {
            const data = await getSearchConsoleDataRaw(period);
            return NextResponse.json({ success: true, ...data });
        }
        if (action === "overview") {
            const [analytics, search] = await Promise.allSettled([
                getAnalyticsDataRaw(period),
                getSearchConsoleDataRaw(period),
            ]);
            return NextResponse.json({
                success: true,
                analytics: analytics.status === "fulfilled" ? analytics.value : null,
                search: search.status === "fulfilled" ? search.value : null,
                analyticsError: analytics.status === "rejected" ? analytics.reason?.message : null,
                searchError: search.status === "rejected" ? search.reason?.message : null,
            });
        }
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    } catch (err: unknown) {
        console.error("Analytics API error:", err);
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
    }
}

/* ── GA4 Data API via REST ── */
async function ga4Report(accessToken: string, propertyId: string, body: Record<string, unknown>) {
    const res = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
        {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }
    );
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `GA4 API error: ${res.status}`);
    }
    return res.json();
}

async function getAnalyticsDataRaw(period: string) {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("No access token");
    const propertyId = await getGA4PropertyId(accessToken);
    const startDate = `${period}daysAgo`;

    const [overviewRes, pagesRes, countriesRes, devicesRes, sourcesRes, dailyRes] = await Promise.all([
        ga4Report(accessToken, propertyId, {
            dateRanges: [{ startDate, endDate: "today" }],
            metrics: [
                { name: "activeUsers" }, { name: "newUsers" }, { name: "sessions" },
                { name: "screenPageViews" }, { name: "averageSessionDuration" }, { name: "bounceRate" },
            ],
        }),
        ga4Report(accessToken, propertyId, {
            dateRanges: [{ startDate, endDate: "today" }],
            dimensions: [{ name: "pagePath" }],
            metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
            orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
            limit: 10,
        }),
        ga4Report(accessToken, propertyId, {
            dateRanges: [{ startDate, endDate: "today" }],
            dimensions: [{ name: "country" }],
            metrics: [{ name: "activeUsers" }],
            orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
            limit: 10,
        }),
        ga4Report(accessToken, propertyId, {
            dateRanges: [{ startDate, endDate: "today" }],
            dimensions: [{ name: "deviceCategory" }],
            metrics: [{ name: "activeUsers" }],
        }),
        ga4Report(accessToken, propertyId, {
            dateRanges: [{ startDate, endDate: "today" }],
            dimensions: [{ name: "sessionSource" }],
            metrics: [{ name: "sessions" }],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            limit: 10,
        }),
        ga4Report(accessToken, propertyId, {
            dateRanges: [{ startDate, endDate: "today" }],
            dimensions: [{ name: "date" }],
            metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
            orderBys: [{ dimension: { dimensionName: "date" } }],
        }),
    ]);

    const row = overviewRes.rows?.[0];
    const overview = {
        activeUsers: Number(row?.metricValues?.[0]?.value || 0),
        newUsers: Number(row?.metricValues?.[1]?.value || 0),
        sessions: Number(row?.metricValues?.[2]?.value || 0),
        pageViews: Number(row?.metricValues?.[3]?.value || 0),
        avgSessionDuration: Number(row?.metricValues?.[4]?.value || 0),
        bounceRate: Number(row?.metricValues?.[5]?.value || 0),
    };

    const parseRows = (res: Record<string, unknown[]>) => res.rows || [];

    const pages = (parseRows(pagesRes) as Record<string, Record<string, string>[]>[]).map((r: Record<string, Record<string, string>[]>) => ({
        path: r.dimensionValues?.[0]?.value || "",
        views: Number(r.metricValues?.[0]?.value || 0),
        users: Number(r.metricValues?.[1]?.value || 0),
    }));

    const countries = (parseRows(countriesRes) as Record<string, Record<string, string>[]>[]).map((r: Record<string, Record<string, string>[]>) => ({
        country: r.dimensionValues?.[0]?.value || "",
        users: Number(r.metricValues?.[0]?.value || 0),
    }));

    const devices = (parseRows(devicesRes) as Record<string, Record<string, string>[]>[]).map((r: Record<string, Record<string, string>[]>) => ({
        device: r.dimensionValues?.[0]?.value || "",
        users: Number(r.metricValues?.[0]?.value || 0),
    }));

    const sources = (parseRows(sourcesRes) as Record<string, Record<string, string>[]>[]).map((r: Record<string, Record<string, string>[]>) => ({
        source: r.dimensionValues?.[0]?.value || "",
        sessions: Number(r.metricValues?.[0]?.value || 0),
    }));

    const daily = (parseRows(dailyRes) as Record<string, Record<string, string>[]>[]).map((r: Record<string, Record<string, string>[]>) => ({
        date: r.dimensionValues?.[0]?.value || "",
        users: Number(r.metricValues?.[0]?.value || 0),
        pageViews: Number(r.metricValues?.[1]?.value || 0),
    }));

    return { overview, pages, countries, devices, sources, daily };
}

/* ── Search Console API ── */
async function getSearchConsoleDataRaw(period: string) {
    const auth = getAuth();
    const searchconsole = google.searchconsole({ version: "v1", auth });
    const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL || "https://aksedigital.com";

    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - Number(period) * 86400000).toISOString().split("T")[0];

    const [queriesRes, pagesRes, dailyRes] = await Promise.all([
        searchconsole.searchanalytics.query({
            siteUrl,
            requestBody: { startDate, endDate, dimensions: ["query"], rowLimit: 20 },
        }),
        searchconsole.searchanalytics.query({
            siteUrl,
            requestBody: { startDate, endDate, dimensions: ["page"], rowLimit: 10 },
        }),
        searchconsole.searchanalytics.query({
            siteUrl,
            requestBody: { startDate, endDate, dimensions: ["date"] },
        }),
    ]);

    const queries = (queriesRes.data.rows || []).map(r => ({
        query: r.keys?.[0] || "",
        clicks: r.clicks || 0,
        impressions: r.impressions || 0,
        ctr: r.ctr || 0,
        position: r.position || 0,
    }));

    const pages = (pagesRes.data.rows || []).map(r => ({
        page: r.keys?.[0] || "",
        clicks: r.clicks || 0,
        impressions: r.impressions || 0,
        ctr: r.ctr || 0,
        position: r.position || 0,
    }));

    const daily = (dailyRes.data.rows || []).map(r => ({
        date: r.keys?.[0] || "",
        clicks: r.clicks || 0,
        impressions: r.impressions || 0,
    }));

    const totalClicks = queries.reduce((s, q) => s + q.clicks, 0);
    const totalImpressions = queries.reduce((s, q) => s + q.impressions, 0);
    const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
    const avgPosition = queries.length > 0 ? queries.reduce((s, q) => s + q.position, 0) / queries.length : 0;

    return {
        overview: { totalClicks, totalImpressions, avgCtr, avgPosition },
        queries, pages, daily,
    };
}
