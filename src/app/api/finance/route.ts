import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get("action") || "transactions";
        const type = searchParams.get("type"); // income / expense
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        if (action === "customers") {
            const { data } = await supabase
                .from("customers")
                .select("name, company")
                .order("name");
            const names = new Set<string>();
            (data || []).forEach((c: { name: string; company?: string }) => {
                if (c.name) names.add(c.name);
                if (c.company) names.add(c.company);
            });
            return NextResponse.json({ success: true, data: Array.from(names).sort() });
        }

        if (action === "categories") {
            const q = supabase.from("finance_categories").select("*").order("name");
            if (type) q.eq("type", type);
            const { data, error } = await q;
            if (error) throw error;
            return NextResponse.json({ success: true, data });
        }

        if (action === "stock") {
            const { data, error } = await supabase.from("finance_stock").select("*").order("name");
            if (error) throw error;
            return NextResponse.json({ success: true, data });
        }

        if (action === "summary") {
            const year = searchParams.get("year") || new Date().getFullYear().toString();
            const { data: transactions } = await supabase
                .from("finance_transactions")
                .select("type, amount, date, category_id")
                .gte("date", `${year}-01-01`)
                .lte("date", `${year}-12-31`);

            const { data: categories } = await supabase.from("finance_categories").select("*");

            // Monthly totals
            const monthly: Record<string, { income: number; expense: number }> = {};
            for (let m = 1; m <= 12; m++) {
                const key = m.toString().padStart(2, "0");
                monthly[key] = { income: 0, expense: 0 };
            }

            // Category totals
            const catTotals: Record<string, { name: string; amount: number; color: string; type: string }> = {};

            let totalIncome = 0, totalExpense = 0;

            (transactions || []).forEach((t: { type: string; amount: number; date: string; category_id: string }) => {
                const month = t.date.substring(5, 7);
                const amt = Number(t.amount);
                if (t.type === "income") {
                    totalIncome += amt;
                    if (monthly[month]) monthly[month].income += amt;
                } else {
                    totalExpense += amt;
                    if (monthly[month]) monthly[month].expense += amt;
                }

                if (t.category_id) {
                    if (!catTotals[t.category_id]) {
                        const cat = (categories || []).find((c: { id: string }) => c.id === t.category_id);
                        catTotals[t.category_id] = { name: cat?.name || "Diğer", amount: 0, color: cat?.color || "#6366f1", type: t.type };
                    }
                    catTotals[t.category_id].amount += amt;
                }
            });

            const monthlyData = Object.entries(monthly).map(([m, v]) => ({
                month: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"][parseInt(m) - 1],
                ...v,
            }));

            return NextResponse.json({
                success: true,
                summary: { totalIncome, totalExpense, net: totalIncome - totalExpense, monthlyData, categoryTotals: Object.values(catTotals) },
            });
        }

        // Default: list transactions
        let q = supabase
            .from("finance_transactions")
            .select("*, finance_categories(name, color, icon)")
            .order("date", { ascending: false });

        if (type) q = q.eq("type", type);
        if (from) q = q.gte("date", from);
        if (to) q = q.lte("date", to);

        const { data, error } = await q.limit(200);
        if (error) throw error;
        return NextResponse.json({ success: true, data });
    } catch (err: unknown) {
        console.error("Finance GET error:", err);
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action } = body;

        if (action === "createTransaction") {
            const { type, category_id, amount, description, date, customer_name, invoice_no, payment_method, status, notes } = body;
            const { data, error } = await supabase.from("finance_transactions").insert({
                type, category_id, amount, description, date, customer_name, invoice_no, payment_method, status: status || "paid", notes,
            }).select().single();
            if (error) throw error;
            return NextResponse.json({ success: true, data });
        }

        if (action === "updateTransaction") {
            const { id, ...updates } = body;
            delete updates.action;
            const { data, error } = await supabase.from("finance_transactions").update(updates).eq("id", id).select().single();
            if (error) throw error;
            return NextResponse.json({ success: true, data });
        }

        if (action === "deleteTransaction") {
            const { error } = await supabase.from("finance_transactions").delete().eq("id", body.id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (action === "createCategory") {
            const { data, error } = await supabase.from("finance_categories").insert({
                name: body.name, type: body.type, color: body.color, icon: body.icon,
            }).select().single();
            if (error) throw error;
            return NextResponse.json({ success: true, data });
        }

        if (action === "deleteCategory") {
            const { error } = await supabase.from("finance_categories").delete().eq("id", body.id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (action === "createStock") {
            const { data, error } = await supabase.from("finance_stock").insert({
                name: body.name, sku: body.sku, category: body.category, quantity: body.quantity,
                unit: body.unit, buy_price: body.buy_price, sell_price: body.sell_price,
                min_stock: body.min_stock, supplier: body.supplier, notes: body.notes,
            }).select().single();
            if (error) throw error;
            return NextResponse.json({ success: true, data });
        }

        if (action === "updateStock") {
            const { id, ...updates } = body;
            delete updates.action;
            updates.updated_at = new Date().toISOString();
            const { data, error } = await supabase.from("finance_stock").update(updates).eq("id", id).select().single();
            if (error) throw error;
            return NextResponse.json({ success: true, data });
        }

        if (action === "deleteStock") {
            const { error } = await supabase.from("finance_stock").delete().eq("id", body.id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    } catch (err: unknown) {
        console.error("Finance POST error:", err);
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
    }
}
