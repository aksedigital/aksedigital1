import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { action } = body;

    if (action === "create") {
        const { name, email, phone, company, tax_no } = body;
        const { data, error } = await supabase.from("customers").insert({ name, email, phone, company, tax_no }).select().single();
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, data });
    }

    if (action === "update") {
        const { id, name, email, phone, company, tax_no } = body;
        const { error } = await supabase.from("customers").update({ name, email, phone, company, tax_no }).eq("id", id);
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    }

    if (action === "delete") {
        const { id } = body;
        const { error } = await supabase.from("customers").delete().eq("id", id);
        if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
}
