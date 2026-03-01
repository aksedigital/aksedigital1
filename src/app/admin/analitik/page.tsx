"use client";

import { useEffect, useState } from "react";
import {
    BarChart3, Users, Eye, MousePointerClick, Search, Globe, Smartphone, Monitor,
    TrendingUp, ArrowUpRight, ArrowDownRight, Minus, Loader2, RefreshCw
} from "lucide-react";

interface AnalyticsOverview {
    activeUsers: number; newUsers: number; sessions: number;
    pageViews: number; avgSessionDuration: number; bounceRate: number;
}
interface SearchOverview {
    totalClicks: number; totalImpressions: number; avgCtr: number; avgPosition: number;
}
interface PageData { path: string; views: number; users: number; }
interface CountryData { country: string; users: number; }
interface DeviceData { device: string; users: number; }
interface SourceData { source: string; sessions: number; }
interface DailyData { date: string; users: number; pageViews: number; }
interface QueryData { query: string; clicks: number; impressions: number; ctr: number; position: number; }
interface SearchDailyData { date: string; clicks: number; impressions: number; }

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("28");
    const [analyticsData, setAnalyticsData] = useState<{
        overview: AnalyticsOverview; pages: PageData[]; countries: CountryData[];
        devices: DeviceData[]; sources: SourceData[]; daily: DailyData[];
    } | null>(null);
    const [searchData, setSearchData] = useState<{
        overview: SearchOverview; queries: QueryData[]; daily: SearchDailyData[];
    } | null>(null);
    const [error, setError] = useState("");
    const [tab, setTab] = useState<"analytics" | "seo">("analytics");

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/analytics?action=overview&period=${period}`);
            const data = await res.json();
            if (data.analytics) setAnalyticsData(data.analytics);
            if (data.search) setSearchData(data.search);
            if (data.analyticsError && data.searchError) setError("API bağlantısı kurulamadı. OAuth token'larını kontrol edin.");
        } catch { setError("Veriler yüklenemedi."); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [period]);

    const fmtNum = (n: number) => n.toLocaleString("tr-TR");
    const fmtPct = (n: number) => `%${(n * 100).toFixed(1)}`;
    const fmtDuration = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}dk ${sec}s`;
    };
    const fmtDate = (d: string) => {
        if (d.length === 8) return `${d.slice(6, 8)}.${d.slice(4, 6)}`;
        return d.slice(8, 10) + "." + d.slice(5, 7);
    };

    const deviceIcon = (d: string) => {
        if (d === "mobile") return <Smartphone className="w-4 h-4" />;
        if (d === "desktop") return <Monitor className="w-4 h-4" />;
        return <Globe className="w-4 h-4" />;
    };
    const deviceLabel = (d: string) => {
        if (d === "mobile") return "Mobil";
        if (d === "desktop") return "Masaüstü";
        if (d === "tablet") return "Tablet";
        return d;
    };

    const maxDaily = analyticsData?.daily ? Math.max(...analyticsData.daily.map(d => d.pageViews), 1) : 1;
    const maxSearchDaily = searchData?.daily ? Math.max(...searchData.daily.map(d => d.impressions), 1) : 1;

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Analitik</h1>
                    <p className="text-sm text-muted mt-1">Site trafiği ve SEO performansı</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                    >
                        <option value="7">Son 7 gün</option>
                        <option value="28">Son 28 gün</option>
                        <option value="90">Son 90 gün</option>
                    </select>
                    <button onClick={fetchData} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted hover:text-foreground transition-colors">
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-[#111] rounded-xl p-1 w-fit border border-white/5">
                <button
                    onClick={() => setTab("analytics")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "analytics" ? "bg-primary/10 text-primary" : "text-muted hover:text-foreground"}`}
                >
                    <BarChart3 className="w-4 h-4" /> Trafik
                </button>
                <button
                    onClick={() => setTab("seo")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "seo" ? "bg-primary/10 text-primary" : "text-muted hover:text-foreground"}`}
                >
                    <Search className="w-4 h-4" /> SEO
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                    <p className="text-red-400 text-sm">{error}</p>
                    <p className="text-xs text-muted mt-2">OAuth token&apos;larının Analytics ve Search Console scope&apos;larına sahip olduğundan emin olun.</p>
                </div>
            ) : tab === "analytics" ? (
                /* ── ANALYTICS TAB ── */
                <div className="space-y-6">
                    {/* Overview Cards */}
                    {analyticsData && (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: "Kullanıcılar", value: fmtNum(analyticsData.overview.activeUsers), icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
                                    { label: "Sayfa Görüntüleme", value: fmtNum(analyticsData.overview.pageViews), icon: Eye, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                                    { label: "Oturumlar", value: fmtNum(analyticsData.overview.sessions), icon: MousePointerClick, color: "text-purple-400", bg: "bg-purple-500/10" },
                                    { label: "Ort. Süre", value: fmtDuration(analyticsData.overview.avgSessionDuration), icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-500/10" },
                                ].map((c) => (
                                    <div key={c.label} className="bg-[#111] border border-white/5 rounded-xl p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs text-muted uppercase tracking-widest">{c.label}</span>
                                            <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
                                                <c.icon className={`w-4 h-4 ${c.color}`} />
                                            </div>
                                        </div>
                                        <p className="text-2xl font-extrabold">{c.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Daily Chart */}
                            {analyticsData.daily.length > 0 && (
                                <div className="bg-[#111] border border-white/5 rounded-xl p-6">
                                    <h3 className="text-sm font-bold mb-4">Günlük Trafik</h3>
                                    <div className="flex items-end gap-[2px] h-40">
                                        {analyticsData.daily.map((d, i) => (
                                            <div key={i} className="flex-1 group relative">
                                                <div
                                                    className="bg-primary/60 hover:bg-primary rounded-t transition-colors w-full"
                                                    style={{ height: `${(d.pageViews / maxDaily) * 100}%`, minHeight: d.pageViews > 0 ? "4px" : "1px" }}
                                                />
                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#222] border border-white/10 rounded-lg px-2 py-1 text-[10px] hidden group-hover:block whitespace-nowrap z-10">
                                                    {fmtDate(d.date)}: {d.pageViews} görüntüleme, {d.users} kullanıcı
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-2 text-[10px] text-muted">
                                        <span>{analyticsData.daily.length > 0 ? fmtDate(analyticsData.daily[0].date) : ""}</span>
                                        <span>{analyticsData.daily.length > 0 ? fmtDate(analyticsData.daily[analyticsData.daily.length - 1].date) : ""}</span>
                                    </div>
                                </div>
                            )}

                            {/* Grid: Pages, Sources, Devices, Countries */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Top Pages */}
                                <div className="bg-[#111] border border-white/5 rounded-xl p-6">
                                    <h3 className="text-sm font-bold mb-4">En Çok Ziyaret Edilen Sayfalar</h3>
                                    <div className="space-y-2">
                                        {analyticsData.pages.map((p, i) => (
                                            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                                <span className="text-sm truncate flex-1 mr-3">{p.path}</span>
                                                <div className="flex items-center gap-4 text-xs text-muted">
                                                    <span>{fmtNum(p.views)} <span className="text-muted/60">görüntüleme</span></span>
                                                    <span>{fmtNum(p.users)} <span className="text-muted/60">kişi</span></span>
                                                </div>
                                            </div>
                                        ))}
                                        {analyticsData.pages.length === 0 && <p className="text-xs text-muted text-center py-4">Henüz veri yok</p>}
                                    </div>
                                </div>

                                {/* Traffic Sources */}
                                <div className="bg-[#111] border border-white/5 rounded-xl p-6">
                                    <h3 className="text-sm font-bold mb-4">Trafik Kaynakları</h3>
                                    <div className="space-y-2">
                                        {analyticsData.sources.map((s, i) => {
                                            const maxSessions = analyticsData.sources[0]?.sessions || 1;
                                            return (
                                                <div key={i} className="relative">
                                                    <div className="absolute inset-0 bg-primary/5 rounded-lg" style={{ width: `${(s.sessions / maxSessions) * 100}%` }} />
                                                    <div className="relative flex items-center justify-between py-2.5 px-3">
                                                        <span className="text-sm">{s.source || "(doğrudan)"}</span>
                                                        <span className="text-xs text-muted font-medium">{fmtNum(s.sessions)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {analyticsData.sources.length === 0 && <p className="text-xs text-muted text-center py-4">Henüz veri yok</p>}
                                    </div>
                                </div>

                                {/* Devices */}
                                <div className="bg-[#111] border border-white/5 rounded-xl p-6">
                                    <h3 className="text-sm font-bold mb-4">Cihazlar</h3>
                                    <div className="space-y-3">
                                        {analyticsData.devices.map((d, i) => {
                                            const totalDeviceUsers = analyticsData.devices.reduce((s, v) => s + v.users, 0) || 1;
                                            const pct = ((d.users / totalDeviceUsers) * 100).toFixed(1);
                                            return (
                                                <div key={i}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            {deviceIcon(d.device)}
                                                            {deviceLabel(d.device)}
                                                        </div>
                                                        <span className="text-xs text-muted">{fmtNum(d.users)} ({pct}%)</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-white/5 rounded-full">
                                                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {analyticsData.devices.length === 0 && <p className="text-xs text-muted text-center py-4">Henüz veri yok</p>}
                                    </div>
                                </div>

                                {/* Countries */}
                                <div className="bg-[#111] border border-white/5 rounded-xl p-6">
                                    <h3 className="text-sm font-bold mb-4">Ülkeler</h3>
                                    <div className="space-y-2">
                                        {analyticsData.countries.map((c, i) => (
                                            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                                <span className="text-sm">{c.country}</span>
                                                <span className="text-xs text-muted">{fmtNum(c.users)} kullanıcı</span>
                                            </div>
                                        ))}
                                        {analyticsData.countries.length === 0 && <p className="text-xs text-muted text-center py-4">Henüz veri yok</p>}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    {!analyticsData && <div className="bg-[#111] border border-white/5 rounded-xl p-12 text-center text-muted text-sm">Analytics verisi bulunamadı. OAuth token scope&apos;larını kontrol edin.</div>}
                </div>
            ) : (
                /* ── SEO TAB ── */
                <div className="space-y-6">
                    {searchData && (
                        <>
                            {/* SEO Overview Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: "Tıklama", value: fmtNum(searchData.overview.totalClicks), icon: MousePointerClick, color: "text-blue-400", bg: "bg-blue-500/10" },
                                    { label: "Gösterim", value: fmtNum(searchData.overview.totalImpressions), icon: Eye, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                                    { label: "Ort. CTR", value: fmtPct(searchData.overview.avgCtr), icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10" },
                                    { label: "Ort. Pozisyon", value: searchData.overview.avgPosition.toFixed(1), icon: ArrowUpRight, color: "text-orange-400", bg: "bg-orange-500/10" },
                                ].map((c) => (
                                    <div key={c.label} className="bg-[#111] border border-white/5 rounded-xl p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs text-muted uppercase tracking-widest">{c.label}</span>
                                            <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
                                                <c.icon className={`w-4 h-4 ${c.color}`} />
                                            </div>
                                        </div>
                                        <p className="text-2xl font-extrabold">{c.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Search Daily Chart */}
                            {searchData.daily.length > 0 && (
                                <div className="bg-[#111] border border-white/5 rounded-xl p-6">
                                    <h3 className="text-sm font-bold mb-4">Günlük Arama Performansı</h3>
                                    <div className="flex items-end gap-[2px] h-40">
                                        {searchData.daily.map((d, i) => (
                                            <div key={i} className="flex-1 group relative">
                                                <div
                                                    className="bg-emerald-500/60 hover:bg-emerald-500 rounded-t transition-colors w-full"
                                                    style={{ height: `${(d.impressions / maxSearchDaily) * 100}%`, minHeight: d.impressions > 0 ? "4px" : "1px" }}
                                                />
                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#222] border border-white/10 rounded-lg px-2 py-1 text-[10px] hidden group-hover:block whitespace-nowrap z-10">
                                                    {d.date}: {d.impressions} gösterim, {d.clicks} tıklama
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-2 text-[10px] text-muted">
                                        <span>{searchData.daily[0]?.date || ""}</span>
                                        <span>{searchData.daily[searchData.daily.length - 1]?.date || ""}</span>
                                    </div>
                                </div>
                            )}

                            {/* Search Queries */}
                            <div className="bg-[#111] border border-white/5 rounded-xl p-6">
                                <h3 className="text-sm font-bold mb-4">
                                    <Search className="w-4 h-4 inline mr-2" />
                                    Arama Sorguları
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                <th className="text-left px-3 py-2 text-xs text-muted uppercase tracking-widest">Arama Kelimesi</th>
                                                <th className="text-right px-3 py-2 text-xs text-muted uppercase tracking-widest">Tıklama</th>
                                                <th className="text-right px-3 py-2 text-xs text-muted uppercase tracking-widest">Gösterim</th>
                                                <th className="text-right px-3 py-2 text-xs text-muted uppercase tracking-widest">CTR</th>
                                                <th className="text-right px-3 py-2 text-xs text-muted uppercase tracking-widest">Pozisyon</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {searchData.queries.map((q, i) => (
                                                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                                                    <td className="px-3 py-2.5 font-medium">{q.query}</td>
                                                    <td className="px-3 py-2.5 text-right text-blue-400">{fmtNum(q.clicks)}</td>
                                                    <td className="px-3 py-2.5 text-right text-muted">{fmtNum(q.impressions)}</td>
                                                    <td className="px-3 py-2.5 text-right text-emerald-400">{fmtPct(q.ctr)}</td>
                                                    <td className="px-3 py-2.5 text-right">
                                                        <span className={`inline-flex items-center gap-1 ${q.position <= 10 ? "text-emerald-400" : q.position <= 30 ? "text-orange-400" : "text-red-400"}`}>
                                                            {q.position <= 10 ? <ArrowUpRight className="w-3 h-3" /> : q.position <= 30 ? <Minus className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                            {q.position.toFixed(1)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {searchData.queries.length === 0 && <p className="text-xs text-muted text-center py-8">Henüz arama verisi yok. Veriler 2-3 gün içinde görünmeye başlar.</p>}
                                </div>
                            </div>
                        </>
                    )}
                    {!searchData && <div className="bg-[#111] border border-white/5 rounded-xl p-12 text-center text-muted text-sm">Search Console verisi bulunamadı. OAuth token scope&apos;larını kontrol edin.</div>}
                </div>
            )}
        </div>
    );
}
