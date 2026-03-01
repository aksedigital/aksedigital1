"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight,
    CreditCard, Wallet, Receipt, Package, ChevronRight, Plus
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts";

interface Summary {
    totalIncome: number;
    totalExpense: number;
    net: number;
    monthlyData: { month: string; income: number; expense: number }[];
    categoryTotals: { name: string; amount: number; color: string; type: string }[];
}

interface Transaction {
    id: string;
    type: string;
    amount: number;
    description: string;
    date: string;
    customer_name?: string;
    status: string;
    finance_categories?: { name: string; color: string };
}

function formatMoney(n: number) {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0 }).format(n);
}

export default function FinanceDashboard() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch(`/api/finance?action=summary&year=${year}`).then(r => r.json()),
            fetch("/api/finance").then(r => r.json()),
        ]).then(([s, t]) => {
            if (s.success) setSummary(s.summary);
            if (t.success) setTransactions(t.data?.slice(0, 10) || []);
            setLoading(false);
        });
    }, [year]);

    const incomeCategories = summary?.categoryTotals.filter(c => c.type === "income") || [];
    const expenseCategories = summary?.categoryTotals.filter(c => c.type === "expense") || [];

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold">Finans</h1>
                        <p className="text-xs text-muted">Gelir, gider ve stok takibi</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <select value={year} onChange={(e) => setYear(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none">
                        {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y} className="bg-[#111]">{y}</option>)}
                    </select>
                    <Link href="/admin/finans/gelirler?new=1"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm transition-colors">
                        <Plus className="w-4 h-4" /> Gelir Ekle
                    </Link>
                    <Link href="/admin/finans/giderler?new=1"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm transition-colors">
                        <Plus className="w-4 h-4" /> Gider Ekle
                    </Link>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { href: "/admin/finans/gelirler", label: "Gelirler", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { href: "/admin/finans/giderler", label: "Giderler", icon: TrendingDown, color: "text-red-400", bg: "bg-red-500/10" },
                    { href: "/admin/finans/stok", label: "Stok Takibi", icon: Package, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { href: "/admin/finans/kategoriler", label: "Kategoriler", icon: Receipt, color: "text-purple-400", bg: "bg-purple-500/10" },
                ].map(item => (
                    <Link key={item.href} href={item.href}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#111] border border-white/5 hover:border-white/10 transition-all group">
                        <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center`}>
                            <item.icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted ml-auto group-hover:text-foreground transition-colors" />
                    </Link>
                ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-muted">Toplam Gelir</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-extrabold text-emerald-400">{formatMoney(summary?.totalIncome || 0)}</p>
                    <p className="text-[10px] text-muted mt-1">{year} yılı toplam</p>
                </div>

                <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-muted">Toplam Gider</span>
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <ArrowDownRight className="w-4 h-4 text-red-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-extrabold text-red-400">{formatMoney(summary?.totalExpense || 0)}</p>
                    <p className="text-[10px] text-muted mt-1">{year} yılı toplam</p>
                </div>

                <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-muted">Net Kâr</span>
                        <div className={`w-8 h-8 rounded-lg ${(summary?.net || 0) >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"} flex items-center justify-center`}>
                            <DollarSign className={`w-4 h-4 ${(summary?.net || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`} />
                        </div>
                    </div>
                    <p className={`text-2xl font-extrabold ${(summary?.net || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {formatMoney(summary?.net || 0)}
                    </p>
                    <p className="text-[10px] text-muted mt-1">Gelir - Gider</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Bar Chart */}
                <div className="lg:col-span-2 bg-[#111] border border-white/5 rounded-2xl p-5">
                    <h3 className="text-sm font-bold mb-4">Aylık Gelir vs Gider</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={summary?.monthlyData || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} />
                            <YAxis tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                            <Tooltip
                                contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                                formatter={(value: number | undefined) => formatMoney(value ?? 0)}
                            />
                            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Gelir" />
                            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Gider" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
                    <h3 className="text-sm font-bold mb-4">Kategori Dağılımı</h3>
                    {incomeCategories.length > 0 || expenseCategories.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie
                                        data={[...incomeCategories, ...expenseCategories]}
                                        cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                                        dataKey="amount" nameKey="name" paddingAngle={2}
                                    >
                                        {[...incomeCategories, ...expenseCategories].map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                                        formatter={(value: number | undefined) => formatMoney(value ?? 0)}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1.5 mt-2">
                                {[...incomeCategories, ...expenseCategories].slice(0, 6).map((c, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[11px]">
                                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                                        <span className="text-muted truncate">{c.name}</span>
                                        <span className="ml-auto font-medium">{formatMoney(c.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-48 text-xs text-muted">Henüz veri yok</div>
                    )}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold">Son İşlemler</h3>
                    <Link href="/admin/finans/gelirler" className="text-xs text-primary hover:underline">Tümünü Gör →</Link>
                </div>
                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted">Henüz işlem yok</div>
                ) : (
                    <div className="space-y-2">
                        {transactions.map((t) => (
                            <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === "income" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                                    {t.type === "income" ? (
                                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                        <ArrowDownRight className="w-4 h-4 text-red-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{t.description || t.customer_name || "İşlem"}</p>
                                    <p className="text-[10px] text-muted">
                                        <span className={t.type === "income" ? "text-emerald-400" : "text-red-400"}>
                                            {t.type === "income" ? "Gelir" : "Gider"}
                                        </span>
                                        {t.finance_categories?.name && ` • ${t.finance_categories.name}`}
                                        {" • "}{new Date(t.date).toLocaleDateString("tr-TR")}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-bold ${t.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                                        {t.type === "income" ? "+" : "-"}{formatMoney(t.amount)}
                                    </p>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${t.status === "paid" ? "bg-emerald-500/10 text-emerald-400" : t.status === "pending" ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"}`}>
                                        {t.status === "paid" ? "Ödendi" : t.status === "pending" ? "Bekliyor" : "Gecikmiş"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
