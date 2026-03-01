import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, company, services, projectDesc, deadline, budget } = body;

        if (!name || !email) {
            return NextResponse.json({ error: "Ad ve e-posta zorunludur." }, { status: 400 });
        }

        const supabase = await createServerSupabase();
        const { error } = await supabase.from("quotes").insert({
            name,
            email,
            phone: phone || null,
            company: company || null,
            services: services || [],
            project_desc: projectDesc || null,
            deadline: deadline || null,
            budget: budget || null,
            status: "new",
        });

        if (error) {
            console.error("Quote form error:", error);
            return NextResponse.json({ error: "Teklif gönderilemedi." }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
    }
}
