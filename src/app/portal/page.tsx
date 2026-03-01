"use client";

import { useState, useEffect } from "react";
import { FileText, FolderOpen, Clock, CheckCircle2 } from "lucide-react";

interface Stats { quotes: number; files: number; }

export default function PortalDashboard() {
    const [stats, setStats] = useState<Stats>({ quotes: 0, files: 0 });
    const [recentQuotes, setRecentQuotes] = useState<{ id: string; name: string; total: number; status: string; created_at: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const [qRes, fRes] = await Promise.all([
                fetch("/api/portal?action=quotes").then(r => r.json()),
                fetch("/api/portal?action=files").then(r => r.json()),
            ]);
            setStats({ quotes: qRes.data?.length || 0, files: fRes.data?.length || 0 });
            setRecentQuotes((qRes.data || []).slice(0, 5));
            setLoading(false);
        })();
    }, []);

    if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-extrabold">Hoş Geldiniz 👋</h1>
                <p className="text-sm text-muted mt-1">Teklifleriniz ve dosyalarınız burada</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <a href="/portal/teklifler" className="bg-[#111] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                        <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold">{stats.quotes}</p>
                    <p className="text-xs text-muted">Teklif</p>
                </a>
                <a href="/portal/dosyalar" className="bg-[#111] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                        <FolderOpen className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-bold">{stats.files}</p>
                    <p className="text-xs text-muted">Paylaşılan Dosya</p>
                </a>
            </div>

            {recentQuotes.length > 0 && (
                <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
                    <h3 className="font-bold text-sm mb-3">Son Teklifler</h3>
                    <div className="space-y-2">
                        {recentQuotes.map(q => (
                            <div key={q.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-3">
                                    {q.status === "accepted" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 text-yellow-400" />}
                                    <div>
                                        <p className="text-xs font-medium">{q.name}</p>
                                        <p className="text-[10px] text-muted">{new Date(q.created_at).toLocaleDateString("tr-TR")}</p>
                                    </div>
                                </div>
                                <p className="text-sm font-bold">{new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(q.total)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
