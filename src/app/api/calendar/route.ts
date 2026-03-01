import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getGoogleCalendar() {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN });
    return google.calendar({ version: "v3", auth: oauth2Client });
}

const EVENT_COLORS: Record<string, string> = {
    shoot: "#a855f7", meeting: "#3b82f6", visit: "#22c55e",
    deadline: "#ef4444", other: "#6366f1",
};

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const action = searchParams.get("action");

        if (action === "customers") {
            const { data } = await supabase.from("customers").select("name, company").order("name");
            const names = new Set<string>();
            (data || []).forEach((c: { name: string; company?: string }) => {
                if (c.name) names.add(c.name);
                if (c.company) names.add(c.company);
            });
            return NextResponse.json({ success: true, data: Array.from(names).sort() });
        }

        let q = supabase
            .from("calendar_events")
            .select("*")
            .order("start_time", { ascending: true });

        if (from) q = q.gte("start_time", from);
        if (to) q = q.lte("start_time", to);

        const { data, error } = await q.limit(500);
        if (error) throw error;
        return NextResponse.json({ success: true, data });
    } catch (err: unknown) {
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action } = body;

        if (action === "create") {
            const { title, type, description, start_time, end_time, all_day, customer_name,
                location, status, reminder_minutes, notes, sync_google } = body;

            const color = EVENT_COLORS[type] || EVENT_COLORS.other;

            const { data, error } = await supabase.from("calendar_events").insert({
                title, type, description, start_time, end_time, all_day,
                customer_name, location, color, status: status || "confirmed",
                reminder_minutes: reminder_minutes || 30, notes,
            }).select().single();
            if (error) throw error;

            // Sync to Google Calendar
            if (sync_google) {
                try {
                    const calendar = getGoogleCalendar();
                    const fmtDt = (dt: string) => {
                        if (!dt) return start_time;
                        // Add timezone if missing
                        if (!dt.includes("+") && !dt.includes("Z") && !dt.match(/\d{2}:\d{2}:\d{2}[+-]/)) {
                            return dt + "+03:00";
                        }
                        return dt;
                    };

                    const gEvent = await calendar.events.insert({
                        calendarId: "primary",
                        requestBody: {
                            summary: title,
                            description: `${description || ""}${customer_name ? `\nMüşteri: ${customer_name}` : ""}`,
                            location: location || undefined,
                            start: all_day
                                ? { date: start_time.split("T")[0], timeZone: "Europe/Istanbul" }
                                : { dateTime: fmtDt(start_time), timeZone: "Europe/Istanbul" },
                            end: all_day
                                ? { date: (end_time || start_time).split("T")[0], timeZone: "Europe/Istanbul" }
                                : { dateTime: fmtDt(end_time || start_time), timeZone: "Europe/Istanbul" },
                            reminders: { useDefault: false, overrides: [{ method: "popup", minutes: reminder_minutes || 30 }] },
                        },
                    });
                    if (gEvent.data.id) {
                        await supabase.from("calendar_events").update({ google_event_id: gEvent.data.id }).eq("id", data.id);
                        data.google_event_id = gEvent.data.id;
                    }
                } catch (gErr: unknown) {
                    const msg = gErr instanceof Error ? gErr.message : String(gErr);
                    console.error("Google Calendar sync error:", msg);
                }
            }

            return NextResponse.json({ success: true, data });
        }

        if (action === "update") {
            const { id, sync_google, ...updates } = body;
            delete updates.action;
            if (updates.type) updates.color = EVENT_COLORS[updates.type] || EVENT_COLORS.other;

            const { data, error } = await supabase.from("calendar_events")
                .update(updates).eq("id", id).select().single();
            if (error) throw error;

            // Sync update to Google
            if (sync_google && data.google_event_id) {
                try {
                    const calendar = getGoogleCalendar();
                    await calendar.events.update({
                        calendarId: "primary",
                        eventId: data.google_event_id,
                        requestBody: {
                            summary: data.title,
                            description: data.description || "",
                            location: data.location || undefined,
                            start: data.all_day
                                ? { date: data.start_time.split("T")[0], timeZone: "Europe/Istanbul" }
                                : { dateTime: data.start_time, timeZone: "Europe/Istanbul" },
                            end: data.all_day
                                ? { date: (data.end_time || data.start_time).split("T")[0], timeZone: "Europe/Istanbul" }
                                : { dateTime: data.end_time || data.start_time, timeZone: "Europe/Istanbul" },
                        },
                    });
                } catch (gErr) {
                    console.error("Google Calendar update error:", gErr);
                }
            }

            return NextResponse.json({ success: true, data });
        }

        if (action === "delete") {
            // Get event to check for Google Calendar ID
            const { data: event } = await supabase.from("calendar_events")
                .select("google_event_id").eq("id", body.id).single();

            if (event?.google_event_id) {
                try {
                    const calendar = getGoogleCalendar();
                    await calendar.events.delete({ calendarId: "primary", eventId: event.google_event_id });
                } catch (gErr) {
                    console.error("Google Calendar delete error:", gErr);
                }
            }

            const { error } = await supabase.from("calendar_events").delete().eq("id", body.id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    } catch (err: unknown) {
        console.error("Calendar POST error:", err);
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
    }
}
