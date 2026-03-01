import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    const { data } = await supabase.from("settings").select("*");
    return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
    const { key, value } = await req.json();
    await supabase.from("settings").upsert({ key, value }, { onConflict: "key" });
    return NextResponse.json({ success: true });
}
