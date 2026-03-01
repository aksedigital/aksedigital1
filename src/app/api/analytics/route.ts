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

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "overview";
    const period = searchParams.get("period") || "28"; // days

    try {
        if (action === "analytics") {
            return await getAnalyticsData(period);
        }
        if (action === "search") {
            return await getSearchConsoleData(period);
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

async function getAnalyticsDataRaw(period: string) {
    const auth = getAuth();
    const analyticsData = google.analyticsdata({ version: "v1beta", auth });
    const propertyId = process.env.GA4_PROPERTY_ID || "468682327"; // from the stream

    const startDate = `${period}daysAgo`;

    // Run report for page views, users, sessions
    const [overviewRes, pagesRes, countriesRes, devicesRes, sourcesRes, dailyRes] = await Promise.all([
        analyticsData.properties.runReport({
            property: `properties/${propertyId}`,
            requestBody: {
                dateRanges: [{ startDate, endDate: "today" }],
                metrics: [
                    { name: "activeUsers" },
                    { name: "newUsers" },
                    { name: "sessions" },
                    { name: "screenPageViews" },
                    { name: "averageSessionDuration" },
                    { name: "bounceRate" },
                ],
            },
        }),
        analyticsData.properties.runReport({
            property: `properties/${propertyId}`,
            requestBody: {
                dateRanges: [{ startDate, endDate: "today" }],
                dimensions: [{ name: "pagePath" }],
                metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
                orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
                limit: "10" as unknown as number,
            },
        }),
        analyticsData.properties.runReport({
            property: `properties/${propertyId}`,
            requestBody: {
                dateRanges: [{ startDate, endDate: "today" }],
                dimensions: [{ name: "country" }],
                metrics: [{ name: "activeUsers" }],
                orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
                limit: "10" as unknown as number,
            },
        }),
        analyticsData.properties.runReport({
            property: `properties/${propertyId}`,
            requestBody: {
                dateRanges: [{ startDate, endDate: "today" }],
                dimensions: [{ name: "deviceCategory" }],
                metrics: [{ name: "activeUsers" }],
            },
        }),
        analyticsData.properties.runReport({
            property: `properties/${propertyId}`,
            requestBody: {
                dateRanges: [{ startDate, endDate: "today" }],
                dimensions: [{ name: "sessionSource" }],
                metrics: [{ name: "sessions" }],
                orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
                limit: "10" as unknown as number,
            },
        }),
        analyticsData.properties.runReport({
            property: `properties/${propertyId}`,
            requestBody: {
                dateRanges: [{ startDate, endDate: "today" }],
                dimensions: [{ name: "date" }],
                metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
                orderBys: [{ dimension: { dimensionName: "date" } }],
            },
        }),
    ]);

    const row = overviewRes.data.rows?.[0];
    const overview = {
        activeUsers: Number(row?.metricValues?.[0]?.value || 0),
        newUsers: Number(row?.metricValues?.[1]?.value || 0),
        sessions: Number(row?.metricValues?.[2]?.value || 0),
        pageViews: Number(row?.metricValues?.[3]?.value || 0),
        avgSessionDuration: Number(row?.metricValues?.[4]?.value || 0),
        bounceRate: Number(row?.metricValues?.[5]?.value || 0),
    };

    const pages = (pagesRes.data.rows || []).map(r => ({
        path: r.dimensionValues?.[0]?.value || "",
        views: Number(r.metricValues?.[0]?.value || 0),
        users: Number(r.metricValues?.[1]?.value || 0),
    }));

    const countries = (countriesRes.data.rows || []).map(r => ({
        country: r.dimensionValues?.[0]?.value || "",
        users: Number(r.metricValues?.[0]?.value || 0),
    }));

    const devices = (devicesRes.data.rows || []).map(r => ({
        device: r.dimensionValues?.[0]?.value || "",
        users: Number(r.metricValues?.[0]?.value || 0),
    }));

    const sources = (sourcesRes.data.rows || []).map(r => ({
        source: r.dimensionValues?.[0]?.value || "",
        sessions: Number(r.metricValues?.[0]?.value || 0),
    }));

    const daily = (dailyRes.data.rows || []).map(r => ({
        date: r.dimensionValues?.[0]?.value || "",
        users: Number(r.metricValues?.[0]?.value || 0),
        pageViews: Number(r.metricValues?.[1]?.value || 0),
    }));

    return { overview, pages, countries, devices, sources, daily };
}

async function getSearchConsoleDataRaw(period: string) {
    const auth = getAuth();
    const searchconsole = google.searchconsole({ version: "v1", auth });
    const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL || "https://aksedigital.com";

    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - Number(period) * 86400000).toISOString().split("T")[0];

    const [queriesRes, pagesRes, dailyRes] = await Promise.all([
        searchconsole.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate,
                endDate,
                dimensions: ["query"],
                rowLimit: 20,
            },
        }),
        searchconsole.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate,
                endDate,
                dimensions: ["page"],
                rowLimit: 10,
            },
        }),
        searchconsole.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate,
                endDate,
                dimensions: ["date"],
            },
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
        queries,
        pages,
        daily,
    };
}

async function getAnalyticsData(period: string) {
    const data = await getAnalyticsDataRaw(period);
    return NextResponse.json({ success: true, ...data });
}

async function getSearchConsoleData(period: string) {
    const data = await getSearchConsoleDataRaw(period);
    return NextResponse.json({ success: true, ...data });
}
