"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { FileText, Trash2, Eye, X, Clock, Mail, Phone, Building } from "lucide-react";

interface Quote {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    services: string[];
    project_desc: string;
    deadline: string;
    budget: string;
    status: string;
    created_at: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
    new: { label: "Yeni", color: "text-blue-400 bg-blue-500/10" },
    reviewing: { label: "İnceleniyor", color: "text-yellow-400 bg-yellow-500/10" },
    accepted: { label: "Kabul Edildi", color: "text-emerald-400 bg-emerald-500/10" },
    rejected: { label: "Reddedildi", color: "text-red-400 bg-red-500/10" },
};

export default function TekliflerPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Quote | null>(null);
    const supabase = createClient();

    const fetchQuotes = async () => {
        const { data } = await supabase
            .from("quotes")
            .select("*")
            .order("created_at", { ascending: false });
        setQuotes(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchQuotes();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        await supabase.from("quotes").update({ status }).eq("id", id);
        if (selected) setSelected({ ...selected, status });
        fetchQuotes();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu teklifi silmek istediğinize emin misiniz?")) return;
        await supabase.from("quotes").delete().eq("id", id);
        setSelected(null);
        fetchQuotes();
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold">Teklif Talepleri</h1>
                <p className="text-sm text-muted mt-1">
                    Siteden gelen teklif talepleri.
                    {!loading && (
                        <span className="ml-2 text-primary font-medium">
                            {quotes.filter((q) => q.status === "new").length} yeni
                        </span>
                    )}
                </p>
            </div>

            {/* Quotes Table */}
            <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left px-5 py-3 text-xs text-muted uppercase font-medium">Ad</th>
                                <th className="text-left px-5 py-3 text-xs text-muted uppercase font-medium hidden md:table-cell">Hizmetler</th>
                                <th className="text-left px-5 py-3 text-xs text-muted uppercase font-medium hidden lg:table-cell">Bütçe</th>
                                <th className="text-left px-5 py-3 text-xs text-muted uppercase font-medium">Durum</th>
                                <th className="text-right px-5 py-3 text-xs text-muted uppercase font-medium">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-muted">Yükleniyor...</td>
                                </tr>
                            ) : quotes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-muted">Henüz teklif talebi yok.</td>
                                </tr>
                            ) : (
                                quotes.map((q) => (
                                    <tr
                                        key={q.id}
                                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                                        onClick={() => setSelected(q)}
                                    >
                                        <td className="px-5 py-3.5">
                                            <div>
                                                <p className="font-medium">{q.name}</p>
                                                <p className="text-xs text-muted">{q.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-muted hidden md:table-cell">
                                            {q.services?.slice(0, 2).join(", ")}
                                            {q.services?.length > 2 && ` +${q.services.length - 2}`}
                                        </td>
                                        <td className="px-5 py-3.5 text-muted hidden lg:table-cell">{q.budget || "—"}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusLabels[q.status]?.color || "text-muted bg-white/5"}`}>
                                                {statusLabels[q.status]?.label || q.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelected(q); }}
                                                    className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-primary transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }}
                                                    className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
                    <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold">Teklif Detayı</h2>
                            <button onClick={() => setSelected(null)} className="text-muted hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-muted w-16">Ad:</span>
                                <span className="font-medium">{selected.name}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="w-4 h-4 text-muted" />
                                <a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a>
                            </div>
                            {selected.phone && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-muted" />
                                    <span>{selected.phone}</span>
                                </div>
                            )}
                            {selected.company && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Building className="w-4 h-4 text-muted" />
                                    <span>{selected.company}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm">
                                <Clock className="w-4 h-4 text-muted" />
                                <span className="text-muted">{formatDate(selected.created_at)}</span>
                            </div>

                            <div>
                                <p className="text-xs text-muted uppercase mb-2">Seçilen Hizmetler</p>
                                <div className="flex flex-wrap gap-2">
                                    {selected.services?.map((s) => (
                                        <span key={s} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">{s}</span>
                                    ))}
                                </div>
                            </div>

                            {selected.project_desc && (
                                <div>
                                    <p className="text-xs text-muted uppercase mb-1">Proje Açıklaması</p>
                                    <p className="text-sm bg-white/5 rounded-xl p-4">{selected.project_desc}</p>
                                </div>
                            )}

                            {selected.deadline && (
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-muted">Termin:</span>
                                    <span>{selected.deadline}</span>
                                </div>
                            )}

                            {selected.budget && (
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-muted">Bütçe:</span>
                                    <span className="font-medium text-primary">{selected.budget}</span>
                                </div>
                            )}

                            {/* Status Buttons */}
                            <div>
                                <p className="text-xs text-muted uppercase mb-2">Durum Değiştir</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(statusLabels).map(([key, val]) => (
                                        <button
                                            key={key}
                                            onClick={() => updateStatus(selected.id, key)}
                                            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${selected.status === key ? val.color + " ring-1 ring-current" : "bg-white/5 text-muted hover:text-foreground"
                                                }`}
                                        >
                                            {val.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <a
                                href={`mailto:${selected.email}`}
                                className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold text-center transition-colors"
                            >
                                Yanıtla
                            </a>
                            <button
                                onClick={() => handleDelete(selected.id)}
                                className="py-2.5 px-4 rounded-xl border border-red-500/20 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
                            >
                                Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
