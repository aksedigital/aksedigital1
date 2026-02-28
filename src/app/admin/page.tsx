"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Users, MessageSquare, TrendingUp, Eye } from "lucide-react";

interface DashboardStats {
    customers: number;
    messages: number;
    todayMessages: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        customers: 0,
        messages: 0,
        todayMessages: 0,
    });
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchStats() {
            const [customersRes, messagesRes] = await Promise.all([
                supabase.from("customers").select("*", { count: "exact", head: true }),
                supabase.from("contacts").select("*", { count: "exact", head: true }),
            ]);

            const today = new Date().toISOString().split("T")[0];
            const todayRes = await supabase
                .from("contacts")
                .select("*", { count: "exact", head: true })
                .gte("created_at", today);

            setStats({
                customers: customersRes.count || 0,
                messages: messagesRes.count || 0,
                todayMessages: todayRes.count || 0,
            });
            setLoading(false);
        }
        fetchStats();
    }, [supabase]);

    const cards = [
        {
            label: "Toplam Müşteri",
            value: stats.customers,
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
        },
        {
            label: "Toplam Mesaj",
            value: stats.messages,
            icon: MessageSquare,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
        },
        {
            label: "Bugünkü Mesaj",
            value: stats.todayMessages,
            icon: TrendingUp,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
        },
        {
            label: "Site Ziyareti",
            value: "—",
            icon: Eye,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted mt-1">Akse Digital yönetim paneline hoş geldiniz.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className="bg-[#111] border border-white/5 rounded-xl p-5"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-muted uppercase tracking-widest">{card.label}</span>
                            <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                                <card.icon className={`w-4 h-4 ${card.color}`} />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold">
                            {loading ? (
                                <span className="inline-block w-12 h-8 bg-white/5 rounded animate-pulse" />
                            ) : (
                                card.value
                            )}
                        </p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-[#111] border border-white/5 rounded-xl p-6">
                <h2 className="font-bold mb-4">Hızlı İşlemler</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <a
                        href="/admin/musteriler"
                        className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-primary/10 transition-colors text-sm"
                    >
                        <Users className="w-4 h-4 text-primary" />
                        Müşteri Ekle
                    </a>
                    <a
                        href="/admin/mesajlar"
                        className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-primary/10 transition-colors text-sm"
                    >
                        <MessageSquare className="w-4 h-4 text-primary" />
                        Mesajları Gör
                    </a>
                    <a
                        href="/"
                        target="_blank"
                        className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-primary/10 transition-colors text-sm"
                    >
                        <Eye className="w-4 h-4 text-primary" />
                        Siteyi Görüntüle
                    </a>
                </div>
            </div>
        </div>
    );
}
