import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, subject, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: "Ad, e-posta ve mesaj alanları zorunludur." },
                { status: 400 }
            );
        }

        const supabase = await createServerSupabase();
        const { error } = await supabase.from("contacts").insert({
            name,
            email,
            phone: phone || null,
            subject: subject || null,
            message,
            is_read: false,
        });

        if (error) {
            console.error("Contact form error:", error);
            return NextResponse.json({ error: "Mesaj gönderilemedi." }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
    }
}
