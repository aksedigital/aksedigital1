"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Mail, Phone, Clock, Trash2, Eye, X } from "lucide-react";

interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export default function MesajlarPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Contact | null>(null);
    const supabase = createClient();

    const fetchContacts = async () => {
        const { data } = await supabase
            .from("contacts")
            .select("*")
            .order("created_at", { ascending: false });
        setContacts(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const markAsRead = async (id: string) => {
        await supabase.from("contacts").update({ is_read: true }).eq("id", id);
        fetchContacts();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
        await supabase.from("contacts").delete().eq("id", id);
        setSelected(null);
        fetchContacts();
    };

    const viewMessage = (c: Contact) => {
        setSelected(c);
        if (!c.is_read) markAsRead(c.id);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold tracking-tight">Mesajlar</h1>
                <p className="text-sm text-muted mt-1">
                    İletişim formundan gelen mesajlar.
                    {!loading && (
                        <span className="ml-2 text-primary font-medium">
                            {contacts.filter((c) => !c.is_read).length} okunmamış
                        </span>
                    )}
                </p>
            </div>

            {/* Messages List */}
            <div className="bg-[#111] border border-white/5 rounded-xl divide-y divide-white/5">
                {loading ? (
                    <div className="p-12 text-center text-muted">Yükleniyor...</div>
                ) : contacts.length === 0 ? (
                    <div className="p-12 text-center text-muted">Henüz mesaj yok.</div>
                ) : (
                    contacts.map((c) => (
                        <div
                            key={c.id}
                            onClick={() => viewMessage(c)}
                            className={`flex items-start gap-4 p-5 cursor-pointer hover:bg-white/[0.02] transition-colors ${!c.is_read ? "bg-primary/[0.03]" : ""
                                }`}
                        >
                            <div
                                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!c.is_read ? "bg-primary" : "bg-transparent"
                                    }`}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-sm ${!c.is_read ? "font-bold" : "font-medium"}`}>
                                        {c.name}
                                    </span>
                                    {c.subject && (
                                        <span className="text-xs text-muted truncate">— {c.subject}</span>
                                    )}
                                </div>
                                <p className="text-xs text-muted truncate">{c.message}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-[10px] text-muted hidden sm:inline">
                                    {formatDate(c.created_at)}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(c.id);
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Message Detail Modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
                    <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold">Mesaj Detayı</h2>
                            <button
                                onClick={() => setSelected(null)}
                                className="text-muted hover:text-foreground"
                            >
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
                                <a href={`mailto:${selected.email}`} className="text-primary hover:underline">
                                    {selected.email}
                                </a>
                            </div>
                            {selected.phone && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-muted" />
                                    <a href={`tel:${selected.phone}`} className="hover:text-primary">
                                        {selected.phone}
                                    </a>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm">
                                <Clock className="w-4 h-4 text-muted" />
                                <span className="text-muted">{formatDate(selected.created_at)}</span>
                            </div>
                            {selected.subject && (
                                <div>
                                    <p className="text-xs text-muted uppercase tracking-widest mb-1">Konu</p>
                                    <p className="text-sm font-medium">{selected.subject}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-muted uppercase tracking-widest mb-1">Mesaj</p>
                                <p className="text-sm leading-relaxed bg-white/5 rounded-xl p-4">{selected.message}</p>
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
                                onClick={() => {
                                    handleDelete(selected.id);
                                }}
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
