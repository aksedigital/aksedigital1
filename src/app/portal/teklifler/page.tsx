"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Eye, Clock, CheckCircle2, XCircle } from "lucide-react";

interface Quote { id: string; name: string; company: string; total: number; status: string; created_at: string; items?: { description: string; quantity: number; price: number }[] }

const STATUS: Record<string, { label: string; css: string; icon: typeof CheckCircle2 }> = {
    draft: { label: "Taslak", css: "text-gray-400", icon: Clock },
    sent: { label: "Gönderildi", css: "text-blue-400", icon: Clock },
    accepted: { label: "Kabul Edildi", css: "text-emerald-400", icon: CheckCircle2 },
    rejected: { label: "Reddedildi", css: "text-red-400", icon: XCircle },
};

export default function PortalTekliflerPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Quote | null>(null);

    useEffect(() => {
        fetch("/api/portal?action=quotes").then(r => r.json()).then(d => { setQuotes(d.data || []); setLoading(false); });
    }, []);

    if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-extrabold">Tekliflerim</h1>
                <p className="text-sm text-muted mt-1">Size gönderilen tüm teklifler</p>
            </div>

            {quotes.length === 0 ? (
                <div className="text-center py-16 bg-[#111] border border-white/5 rounded-2xl">
                    <FileText className="w-12 h-12 text-muted/20 mx-auto mb-3" />
                    <p className="text-sm text-muted">Henüz teklif bulunmuyor</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {quotes.map(q => {
                        const st = STATUS[q.status] || STATUS.draft;
                        return (
                            <div key={q.id} onClick={() => setSelected(q)}
                                className="bg-[#111] border border-white/5 rounded-2xl p-4 hover:border-white/10 cursor-pointer transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{q.name}</p>
                                            <p className="text-[10px] text-muted">{new Date(q.created_at).toLocaleDateString("tr-TR")}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(q.total)}</p>
                                        <span className={`text-[10px] ${st.css} flex items-center gap-1 justify-end`}>
                                            <st.icon className="w-2.5 h-2.5" /> {st.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detail modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold mb-4">{selected.name}</h3>
                        <p className="text-xs text-muted mb-4">Toplam: <span className="font-bold text-foreground">{new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(selected.total)}</span></p>
                        {selected.items && selected.items.length > 0 && (
                            <div className="space-y-2 mb-4">
                                {selected.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-xs p-2 bg-white/[0.02] rounded-lg">
                                        <span>{item.description}</span>
                                        <span className="text-muted">{item.quantity} x {item.price}₺</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button onClick={() => setSelected(null)} className="w-full py-2 text-sm text-muted hover:bg-white/5 rounded-xl">Kapat</button>
                    </div>
                </div>
            )}
        </div>
    );
}
