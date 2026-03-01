import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
        const { data, error } = await supabase.from("proposals").select("*").eq("id", id).single();
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, data });
    }

    const { data, error } = await supabase.from("proposals").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { action, ...rest } = body;

    if (action === "create") {
        const { data, error } = await supabase.from("proposals").insert(rest).select("id").single();
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, id: data.id });
    }

    if (action === "update") {
        const { id, ...payload } = rest;
        const { error } = await supabase.from("proposals").update(payload).eq("id", id);
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    }

    if (action === "delete") {
        const { error } = await supabase.from("proposals").delete().eq("id", rest.id);
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
}
