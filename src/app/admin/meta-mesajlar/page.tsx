"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    MessageCircle, Send, Search, Archive, Trash2, Phone, Image as ImageIcon,
    MoreVertical, Check, CheckCheck, Clock, AlertCircle, X
} from "lucide-react";

interface Conversation {
    id: string; platform: string; contact_id: string; contact_name: string;
    contact_avatar?: string; last_message: string; last_message_at: string;
    unread_count: number; status: string;
}

interface Message {
    id: string; conversation_id: string; direction: string; content: string;
    media_url?: string; media_type?: string; status: string; created_at: string;
}

const PLATFORM_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    whatsapp: { label: "WhatsApp", color: "text-green-400", bg: "bg-green-500/10", icon: "💬" },
    messenger: { label: "Messenger", color: "text-blue-400", bg: "bg-blue-500/10", icon: "💙" },
    instagram: { label: "Instagram", color: "text-pink-400", bg: "bg-pink-500/10", icon: "📷" },
};

const STATUS_ICON: Record<string, typeof Check> = {
    sent: Check, delivered: CheckCheck, read: CheckCheck, failed: AlertCircle,
};

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "şimdi";
    if (mins < 60) return `${mins}dk`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}sa`;
    const days = Math.floor(hrs / 24);
    return `${days}g`;
}

export default function MetaMesajlarPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [platform, setPlatform] = useState("all");
    const [search, setSearch] = useState("");
    const [inputMsg, setInputMsg] = useState("");
    const [sending, setSending] = useState(false);
    const [showMenu, setShowMenu] = useState<string | null>(null);
    const msgEndRef = useRef<HTMLDivElement>(null);

    const fetchConversations = useCallback(async () => {
        const res = await fetch(`/api/meta/messages?platform=${platform}`);
        const d = await res.json();
        if (d.success) setConversations(d.data || []);
        setLoading(false);
    }, [platform]);

    useEffect(() => { fetchConversations(); }, [fetchConversations]);

    // Poll for new messages every 10s
    useEffect(() => {
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, [fetchConversations]);

    const selectConversation = async (conv: Conversation) => {
        setSelectedConv(conv);
        const res = await fetch(`/api/meta/messages?action=messages&conversation_id=${conv.id}`);
        const d = await res.json();
        if (d.success) setMessages(d.data || []);
        // Update unread locally
        setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c));
        setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const handleSend = async () => {
        if (!inputMsg.trim() || !selectedConv) return;
        const content = inputMsg.trim();
        setInputMsg("");
        setSending(true);

        // Optimistic update
        const tempMsg: Message = {
            id: Date.now().toString(), conversation_id: selectedConv.id,
            direction: "outbound", content, status: "sent", created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempMsg]);
        setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

        const res = await fetch("/api/meta/messages", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "send", conversation_id: selectedConv.id, content }),
        });
        const d = await res.json();
        if (d.success && d.data) {
            setMessages(prev => prev.map(m => m.id === tempMsg.id ? d.data : m));
        }
        setSending(false);
    };

    const handleArchive = async (id: string) => {
        await fetch("/api/meta/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "archive", id }) });
        setConversations(prev => prev.filter(c => c.id !== id));
        if (selectedConv?.id === id) { setSelectedConv(null); setMessages([]); }
        setShowMenu(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu konuşmayı silmek istediğinize emin misiniz?")) return;
        await fetch("/api/meta/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
        setConversations(prev => prev.filter(c => c.id !== id));
        if (selectedConv?.id === id) { setSelectedConv(null); setMessages([]); }
        setShowMenu(null);
    };

    const filtered = conversations.filter(c =>
        (c.contact_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.last_message || "").toLowerCase().includes(search.toLowerCase())
    );

    const totalUnread = conversations.reduce((s, c) => s + (c.unread_count || 0), 0);

    return (
        <div className="h-[calc(100vh-130px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold">Meta Mesajlar</h1>
                        <p className="text-xs text-muted">WhatsApp • Messenger • Instagram
                            {totalUnread > 0 && <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full">{totalUnread}</span>}
                        </p>
                    </div>
                </div>
                <div className="flex bg-white/5 rounded-xl p-0.5">
                    {[
                        { key: "all", label: "Tümü" },
                        { key: "whatsapp", label: "💬" },
                        { key: "messenger", label: "💙" },
                        { key: "instagram", label: "📷" },
                    ].map(p => (
                        <button key={p.key} onClick={() => setPlatform(p.key)}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${platform === p.key ? "bg-white/10 font-medium" : "text-muted hover:text-foreground"}`}>
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main layout */}
            <div className="flex-1 flex gap-0 bg-[#111] border border-white/5 rounded-2xl overflow-hidden min-h-0">
                {/* Conversation List */}
                <div className="w-80 border-r border-white/5 flex flex-col flex-shrink-0">
                    {/* Search */}
                    <div className="p-3 border-b border-white/5">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)}
                                placeholder="Konuşma ara..."
                                className="w-full bg-white/5 border-none rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" />
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <MessageCircle className="w-10 h-10 text-muted/20 mx-auto mb-2" />
                                <p className="text-xs text-muted">Henüz konuşma yok</p>
                                <p className="text-[10px] text-muted/60 mt-1">Meta hesaplarını bağladığında mesajlar burada görünecek</p>
                            </div>
                        ) : (
                            filtered.map(conv => {
                                const pc = PLATFORM_CONFIG[conv.platform] || PLATFORM_CONFIG.whatsapp;
                                const isSelected = selectedConv?.id === conv.id;
                                return (
                                    <div key={conv.id} onClick={() => selectConversation(conv)}
                                        className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-all relative group
                      ${isSelected ? "bg-white/[0.05]" : "hover:bg-white/[0.02]"}
                      border-b border-white/[0.03]`}>
                                        {/* Avatar */}
                                        <div className={`w-10 h-10 rounded-full ${pc.bg} flex items-center justify-center flex-shrink-0 text-lg`}>
                                            {pc.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-medium truncate">{conv.contact_name || conv.contact_id}</p>
                                                <span className="text-[9px] text-muted flex-shrink-0">{timeAgo(conv.last_message_at)}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-0.5">
                                                <p className="text-[10px] text-muted truncate flex-1">{conv.last_message || "..."}</p>
                                                {conv.unread_count > 0 && (
                                                    <span className="w-4 h-4 bg-green-500 text-white text-[9px] rounded-full flex items-center justify-center flex-shrink-0 ml-1">
                                                        {conv.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {/* Context menu */}
                                        <button onClick={(e) => { e.stopPropagation(); setShowMenu(showMenu === conv.id ? null : conv.id); }}
                                            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/5 absolute right-2 top-2">
                                            <MoreVertical className="w-3 h-3 text-muted" />
                                        </button>
                                        {showMenu === conv.id && (
                                            <div className="absolute right-2 top-8 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl z-10 py-1 min-w-[120px]"
                                                onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => handleArchive(conv.id)}
                                                    className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-white/5 flex items-center gap-2">
                                                    <Archive className="w-3 h-3" /> Arşivle
                                                </button>
                                                <button onClick={() => handleDelete(conv.id)}
                                                    className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-red-500/10 text-red-400 flex items-center gap-2">
                                                    <Trash2 className="w-3 h-3" /> Sil
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    {selectedConv ? (
                        <>
                            {/* Chat header */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                                <div className={`w-9 h-9 rounded-full ${PLATFORM_CONFIG[selectedConv.platform]?.bg || "bg-white/5"} flex items-center justify-center text-base`}>
                                    {PLATFORM_CONFIG[selectedConv.platform]?.icon || "💬"}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{selectedConv.contact_name}</p>
                                    <p className={`text-[10px] ${PLATFORM_CONFIG[selectedConv.platform]?.color || "text-muted"}`}>
                                        {PLATFORM_CONFIG[selectedConv.platform]?.label || selectedConv.platform}
                                        {selectedConv.platform === "whatsapp" && ` • ${selectedConv.contact_id}`}
                                    </p>
                                </div>
                                <button onClick={() => { setSelectedConv(null); setMessages([]); }}
                                    className="p-1.5 rounded-lg hover:bg-white/5 text-muted lg:hidden">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                                {messages.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-xs text-muted">Henüz mesaj yok</p>
                                    </div>
                                ) : (
                                    messages.map(msg => {
                                        const isOut = msg.direction === "outbound";
                                        const StIcon = STATUS_ICON[msg.status] || Check;
                                        return (
                                            <div key={msg.id} className={`flex ${isOut ? "justify-end" : "justify-start"}`}>
                                                <div className={`max-w-[70%] rounded-2xl px-3.5 py-2 ${isOut
                                                    ? "bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/10"
                                                    : "bg-white/5 border border-white/5"
                                                    }`}>
                                                    {msg.media_url && (
                                                        <div className="mb-1.5 flex items-center gap-1 text-[10px] text-muted">
                                                            <ImageIcon className="w-3 h-3" /> Medya
                                                        </div>
                                                    )}
                                                    <p className="text-xs whitespace-pre-wrap break-words">{msg.content}</p>
                                                    <div className={`flex items-center gap-1 mt-1 ${isOut ? "justify-end" : ""}`}>
                                                        <span className="text-[9px] text-muted">
                                                            {new Date(msg.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                        {isOut && <StIcon className={`w-2.5 h-2.5 ${msg.status === "read" ? "text-blue-400" : msg.status === "failed" ? "text-red-400" : "text-muted"}`} />}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={msgEndRef} />
                            </div>

                            {/* Input */}
                            <div className="px-4 py-3 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <input value={inputMsg} onChange={(e) => setInputMsg(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                                        placeholder="Mesaj yazın..."
                                        disabled={sending}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/30 disabled:opacity-50" />
                                    <button onClick={handleSend} disabled={sending || !inputMsg.trim()}
                                        className="w-10 h-10 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-30 flex items-center justify-center transition-colors">
                                        <Send className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                                {!process.env.NEXT_PUBLIC_SUPABASE_URL && (
                                    <p className="text-[10px] text-yellow-400/60 mt-1">⚠ Meta API token&apos;ları henüz yapılandırılmadı</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto mb-4">
                                    <MessageCircle className="w-10 h-10 text-muted/20" />
                                </div>
                                <p className="text-sm text-muted font-medium">Bir konuşma seçin</p>
                                <p className="text-[11px] text-muted/60 mt-1 max-w-xs">
                                    Sol panelden bir konuşma seçerek mesaj geçmişini görüntüleyin ve yanıt gönderin
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
