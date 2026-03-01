import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@/lib/auth";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getCustomerUser(req: NextRequest) {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return null;
    const user = await verifyToken(token);
    if (!user || user.role !== "customer") return null;
    return user;
}

export async function GET(req: NextRequest) {
    try {
        const user = await getCustomerUser(req);
        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const action = searchParams.get("action");

        // Get customer's quotes
        if (action === "quotes") {
            // Get customer_user to find linked customer
            const { data: custUser } = await supabase
                .from("customer_users")
                .select("customer_id, name, phone")
                .eq("id", user.id)
                .single();

            let quotes: unknown[] = [];
            if (custUser?.customer_id) {
                // Get quotes linked to customer
                const { data } = await supabase
                    .from("quotes")
                    .select("*")
                    .eq("customer_id", custUser.customer_id)
                    .order("created_at", { ascending: false });
                quotes = data || [];
            } else {
                // Try matching by name or phone
                const { data } = await supabase
                    .from("quotes")
                    .select("*")
                    .or(`name.ilike.%${user.name}%,phone.eq.${user.phone}`)
                    .order("created_at", { ascending: false });
                quotes = data || [];
            }

            return NextResponse.json({ success: true, data: quotes });
        }

        // Get shared files
        if (action === "files") {
            const { data } = await supabase
                .from("shared_files")
                .select("*")
                .eq("customer_user_id", user.id)
                .order("shared_at", { ascending: false });
            return NextResponse.json({ success: true, data: data || [] });
        }

        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    } catch (err: unknown) {
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
    }
}
