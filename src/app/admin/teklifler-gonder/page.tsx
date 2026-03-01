"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Search, Trash2, Eye, Edit, Copy, Check, TrendingUp, FileText, CheckCircle, XCircle, Clock } from "lucide-react";

interface Proposal {
    id: string;
    proposal_no: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_company: string;
    subject: string;
    subtotal: number;
    discount_type: string;
    discount_value: number;
    tax_total: number;
    total: number;
    currency: string;
    status: string;
    valid_until: string;
    created_at: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
    draft: { label: "Taslak", color: "text-gray-400 bg-gray-500/10" },
    sent: { label: "Gönderildi", color: "text-blue-400 bg-blue-500/10" },
    viewed: { label: "Görüntülendi", color: "text-yellow-400 bg-yellow-500/10" },
    accepted: { label: "Kabul Edildi", color: "text-emerald-400 bg-emerald-500/10" },
    rejected: { label: "Reddedildi", color: "text-red-400 bg-red-500/10" },
};

const currencySymbol: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€" };

export default function ProposalListPage() {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [copied, setCopied] = useState<string | null>(null);
    const supabase = createClient();

    const fetchProposals = async () => {
        const { data } = await supabase.from("proposals").select("*").order("created_at", { ascending: false });
        setProposals(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchProposals();
        const ch = supabase
            .channel("proposals-list")
            .on("postgres_changes", { event: "*", schema: "public", table: "proposals" }, () => fetchProposals())
            .subscribe();
        return () => { supabase.removeChannel(ch); };
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Bu teklifi silmek istediğinize emin misiniz?")) return;
        await supabase.from("proposals").delete().eq("id", id);
        fetchProposals();
    };

    const copyLink = (id: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/teklif-goruntule/${id}`);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    // Stats calculations
    const totalProposals = proposals.length;
    const acceptedProposals = proposals.filter((p) => p.status === "accepted");
    const rejectedProposals = proposals.filter((p) => p.status === "rejected");
    const pendingProposals = proposals.filter((p) => ["sent", "viewed"].includes(p.status));

    const totalRevenue = acceptedProposals.reduce((sum, p) => sum + Number(p.total || 0), 0);
    const totalAllProposals = proposals.reduce((sum, p) => sum + Number(p.total || 0), 0);
    const totalDiscount = proposals.reduce((sum, p) => {
        const sub = Number(p.subtotal || 0);
        const dv = Number(p.discount_value || 0);
        if (p.discount_type === "percent") return sum + sub * (dv / 100);
        return sum + dv;
    }, 0);

    const filtered = proposals.filter((p) => {
        const matchSearch =
            p.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
            p.proposal_no?.toLowerCase().includes(search.toLowerCase()) ||
            p.subject?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "all" || p.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }) : "—";
    const formatMoney = (v: number, c?: string) => `${Number(v || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ${currencySymbol[c || "TRY"] || "₺"}`;

    const stats = [
        { label: "Toplam Teklif", value: totalProposals, icon: FileText, accent: "text-blue-400 bg-blue-500/10" },
        { label: "Kabul Edilen", value: acceptedProposals.length, icon: CheckCircle, accent: "text-emerald-400 bg-emerald-500/10" },
        { label: "Reddedilen", value: rejectedProposals.length, icon: XCircle, accent: "text-red-400 bg-red-500/10" },
        { label: "Bekleyen", value: pendingProposals.length, icon: Clock, accent: "text-yellow-400 bg-yellow-500/10" },
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold">Teklif Gönder</h1>
                    <p className="text-sm text-muted mt-1">Tüm tekliflerinizi yönetin</p>
                </div>
                <Link
                    href="/admin/teklifler-gonder/olustur"
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Teklif
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {stats.map((s) => (
                    <div key={s.label} className="bg-[#111] border border-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted">{s.label}</span>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.accent}`}>
                                <s.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-extrabold">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <div className="bg-[#111] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs text-muted">Kabul Edilen Toplam</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-400">{formatMoney(totalRevenue)}</p>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs text-muted">Tüm Teklifler Toplamı</span>
                    </div>
                    <p className="text-xl font-bold text-blue-400">{formatMoney(totalAllProposals)}</p>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-red-400">%</span>
                        <span className="text-xs text-muted">Toplam İndirim</span>
                    </div>
                    <p className="text-xl font-bold text-red-400">{formatMoney(totalDiscount)}</p>
                </div>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                        type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Teklif ara..."
                        className="w-full bg-[#111] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
                <select
                    value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-[#111] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                >
                    <option value="all">Tüm Durumlar</option>
                    <option value="draft">Taslak</option>
                    <option value="sent">Gönderildi</option>
                    <option value="viewed">Görüntülendi</option>
                    <option value="accepted">Kabul Edildi</option>
                    <option value="rejected">Reddedildi</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left px-5 py-3 text-xs text-muted uppercase font-medium">Teklif No</th>
                                <th className="text-left px-5 py-3 text-xs text-muted uppercase font-medium">Müşteri</th>
                                <th className="text-left px-5 py-3 text-xs text-muted uppercase font-medium hidden md:table-cell">Konu</th>
                                <th className="text-right px-5 py-3 text-xs text-muted uppercase font-medium hidden md:table-cell">Ara Toplam</th>
                                <th className="text-right px-5 py-3 text-xs text-muted uppercase font-medium hidden lg:table-cell">İndirim</th>
                                <th className="text-right px-5 py-3 text-xs text-muted uppercase font-medium">Toplam</th>
                                <th className="text-left px-5 py-3 text-xs text-muted uppercase font-medium">Durum</th>
                                <th className="text-right px-5 py-3 text-xs text-muted uppercase font-medium">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="text-center py-12 text-muted">Yükleniyor...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-12 text-muted">
                                    {search || filterStatus !== "all" ? "Sonuç bulunamadı." : "Henüz teklif oluşturulmamış."}
                                </td></tr>
                            ) : (
                                filtered.map((p) => {
                                    const sub = Number(p.subtotal || 0);
                                    const dv = Number(p.discount_value || 0);
                                    const disc = p.discount_type === "percent" ? sub * (dv / 100) : dv;
                                    const sym = currencySymbol[p.currency] || "₺";

                                    return (
                                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            <td className="px-5 py-3.5">
                                                <span className="font-mono text-xs text-primary">{p.proposal_no}</span>
                                                <p className="text-[10px] text-muted mt-0.5">{formatDate(p.created_at)}</p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="font-medium">{p.customer_name}</p>
                                                <p className="text-xs text-muted">{p.customer_company || p.customer_email || ""}</p>
                                            </td>
                                            <td className="px-5 py-3.5 text-muted text-xs hidden md:table-cell">{p.subject || "—"}</td>
                                            <td className="px-5 py-3.5 text-right text-xs text-muted hidden md:table-cell">{formatMoney(sub, p.currency)}</td>
                                            <td className="px-5 py-3.5 text-right text-xs hidden lg:table-cell">
                                                {disc > 0 ? (
                                                    <span className="text-red-400">-{formatMoney(disc, p.currency)}</span>
                                                ) : (
                                                    <span className="text-muted">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-bold">{formatMoney(Number(p.total || 0), p.currency)}</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusMap[p.status]?.color || "text-muted bg-white/5"}`}>
                                                    {statusMap[p.status]?.label || p.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => copyLink(p.id)} className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-foreground transition-colors" title="Link kopyala">
                                                        {copied === p.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                    </button>
                                                    <Link href={`/teklif-goruntule/${p.id}`} target="_blank" className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-primary transition-colors" title="Önizle">
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <Link href={`/admin/teklifler-gonder/olustur?edit=${p.id}`} className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-primary transition-colors" title="Düzenle">
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors" title="Sil">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
