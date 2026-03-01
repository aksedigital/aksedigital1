import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { createToken, verifyToken, AUTH_COOKIE_OPTIONS } from "@/lib/auth";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action } = body;

        // Admin login
        if (action === "admin_login") {
            const { phone, password } = body;
            if (!phone || !password) return NextResponse.json({ success: false, error: "Telefon ve şifre gerekli" });

            const cleanPhone = phone.replace(/\s/g, "");
            const { data: user } = await supabase
                .from("admin_users")
                .select("*")
                .eq("phone", cleanPhone)
                .single();

            if (!user) return NextResponse.json({ success: false, error: "Telefon numarası bulunamadı" });

            const valid = await bcrypt.compare(password, user.password_hash);
            if (!valid) return NextResponse.json({ success: false, error: "Şifre hatalı" });

            const token = await createToken({
                id: user.id, phone: user.phone, name: user.name,
                email: user.email, avatar_url: user.avatar_url, role: user.role,
            });

            const res = NextResponse.json({ success: true, user: { id: user.id, name: user.name, phone: user.phone, email: user.email, avatar_url: user.avatar_url, role: user.role } });
            res.cookies.set("auth_token", token, AUTH_COOKIE_OPTIONS);
            return res;
        }

        // Customer login
        if (action === "customer_login") {
            const { phone, password } = body;
            if (!phone || !password) return NextResponse.json({ success: false, error: "Telefon ve şifre gerekli" });

            const cleanPhone = phone.replace(/\s/g, "");
            const { data: user } = await supabase
                .from("customer_users")
                .select("*")
                .eq("phone", cleanPhone)
                .single();

            if (!user) return NextResponse.json({ success: false, error: "Telefon numarası bulunamadı" });

            const valid = await bcrypt.compare(password, user.password_hash);
            if (!valid) return NextResponse.json({ success: false, error: "Şifre hatalı" });

            const token = await createToken({
                id: user.id, phone: user.phone, name: user.name,
                email: user.email, avatar_url: user.avatar_url, role: "customer",
            });

            const res = NextResponse.json({ success: true, user: { id: user.id, name: user.name, phone: user.phone, email: user.email, company: user.company, avatar_url: user.avatar_url } });
            res.cookies.set("auth_token", token, AUTH_COOKIE_OPTIONS);
            return res;
        }

        // Logout
        if (action === "logout") {
            const res = NextResponse.json({ success: true });
            res.cookies.set("auth_token", "", { ...AUTH_COOKIE_OPTIONS, maxAge: 0 });
            return res;
        }

        // Get current user
        if (action === "me") {
            const token = req.cookies.get("auth_token")?.value;
            if (!token) return NextResponse.json({ success: false, error: "Not authenticated" });
            const user = await verifyToken(token);
            if (!user) return NextResponse.json({ success: false, error: "Invalid token" });
            return NextResponse.json({ success: true, user });
        }

        // Update admin profile
        if (action === "update_profile") {
            const token = req.cookies.get("auth_token")?.value;
            if (!token) return NextResponse.json({ success: false, error: "Not authenticated" });
            const authUser = await verifyToken(token);
            if (!authUser) return NextResponse.json({ success: false, error: "Invalid token" });

            const { name, email, avatar_url } = body;
            const table = authUser.role === "customer" ? "customer_users" : "admin_users";

            const { error } = await supabase.from(table).update({ name, email, avatar_url }).eq("id", authUser.id);
            if (error) throw error;

            // Issue new token with updated info
            const newToken = await createToken({ ...authUser, name: name || authUser.name, email: email || authUser.email, avatar_url: avatar_url || authUser.avatar_url });
            const res = NextResponse.json({ success: true });
            res.cookies.set("auth_token", newToken, AUTH_COOKIE_OPTIONS);
            return res;
        }

        // Change password
        if (action === "change_password") {
            const token = req.cookies.get("auth_token")?.value;
            if (!token) return NextResponse.json({ success: false, error: "Not authenticated" });
            const authUser = await verifyToken(token);
            if (!authUser) return NextResponse.json({ success: false, error: "Invalid token" });

            const { current_password, new_password } = body;
            const table = authUser.role === "customer" ? "customer_users" : "admin_users";

            const { data: user } = await supabase.from(table).select("password_hash").eq("id", authUser.id).single();
            if (!user) return NextResponse.json({ success: false, error: "User not found" });

            const valid = await bcrypt.compare(current_password, user.password_hash);
            if (!valid) return NextResponse.json({ success: false, error: "Mevcut şifre hatalı" });

            const hash = await bcrypt.hash(new_password, 10);
            await supabase.from(table).update({ password_hash: hash }).eq("id", authUser.id);
            return NextResponse.json({ success: true });
        }

        // Create customer user (admin only)
        if (action === "create_customer_user") {
            const token = req.cookies.get("auth_token")?.value;
            if (!token) return NextResponse.json({ success: false, error: "Not authenticated" });
            const authUser = await verifyToken(token);
            if (!authUser || authUser.role === "customer") return NextResponse.json({ success: false, error: "Unauthorized" });

            const { phone, password, name, email, company, customer_id } = body;
            const hash = await bcrypt.hash(password, 10);
            const { data, error } = await supabase.from("customer_users").insert({
                phone: phone.replace(/\s/g, ""), password_hash: hash, name, email, company, customer_id,
            }).select().single();
            if (error) throw error;
            return NextResponse.json({ success: true, data });
        }

        // Save Meta API settings
        if (action === "save_meta_settings") {
            const token = req.cookies.get("auth_token")?.value;
            if (!token) return NextResponse.json({ success: false, error: "Not authenticated" });
            const authUser = await verifyToken(token);
            if (!authUser || authUser.role === "customer") return NextResponse.json({ success: false, error: "Unauthorized" });

            const { settings } = body;
            for (const [key, value] of Object.entries(settings)) {
                await supabase.from("settings").upsert({ key: `meta_${key}`, value: value as string }, { onConflict: "key" });
            }
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    } catch (err: unknown) {
        console.error("Auth API error:", err);
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
    }
}
