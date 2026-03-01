"use client";

import { useState, useEffect, useRef } from "react";
import {
    Inbox, Send as SendIcon, FileText, Trash2, Star, RefreshCw, Search,
    Paperclip, Bold, Italic, Link2, List, Image, X, Mail, ChevronDown, AlertCircle,
} from "lucide-react";

interface EmailAddress {
    name: string;
    address: string;
}

interface EmailSummary {
    uid: number;
    from: EmailAddress;
    to: EmailAddress[];
    subject: string;
    date: string;
    seen: boolean;
    flagged: boolean;
    size: number;
}

interface EmailFull {
    uid: number;
    from: EmailAddress;
    to: EmailAddress[];
    cc: EmailAddress[];
    subject: string;
    date: string;
    html: string;
    text: string;
    flags: string[];
    attachments: { filename: string; contentType: string; size: number; contentBase64: string }[];
}

const folders = [
    { key: "INBOX", label: "Gelen Kutusu", icon: Inbox },
    { key: "[Gmail]/Sent Mail", label: "Gönderilenler", icon: SendIcon },
    { key: "[Gmail]/Drafts", label: "Taslaklar", icon: FileText },
    { key: "[Gmail]/Spam", label: "Spam", icon: AlertCircle },
    { key: "[Gmail]/Trash", label: "Çöp Kutusu", icon: Trash2 },
];

export default function EmailPage() {
    const [emails, setEmails] = useState<EmailSummary[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [folder, setFolder] = useState("INBOX");
    const [selectedUid, setSelectedUid] = useState<number | null>(null);
    const [selectedEmail, setSelectedEmail] = useState<EmailFull | null>(null);
    const [readingLoading, setReadingLoading] = useState(false);
    const [showCompose, setShowCompose] = useState(false);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    // Compose state
    const [composeTo, setComposeTo] = useState<string[]>([]);
    const [composeToInput, setComposeToInput] = useState("");
    const [composeSubject, setComposeSubject] = useState("");
    const [composeBody, setComposeBody] = useState("");
    const [composeSending, setComposeSending] = useState(false);
    const [replyTo, setReplyTo] = useState<EmailFull | null>(null);
    const bodyRef = useRef<HTMLDivElement>(null);

    const fetchEmails = async (f?: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/email/inbox?folder=${encodeURIComponent(f || folder)}`);
            const data = await res.json();
            if (data.emails) {
                setEmails(data.emails);
                setTotal(data.total || 0);
            }
        } catch {
            setEmails([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEmails();
    }, [folder]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchEmails();
        setRefreshing(false);
    };

    const handleSelectEmail = async (uid: number) => {
        setSelectedUid(uid);
        setReadingLoading(true);
        try {
            const res = await fetch(`/api/email/read?uid=${uid}&folder=${encodeURIComponent(folder)}`);
            const data = await res.json();
            if (!data.error) {
                setSelectedEmail(data);
                setEmails((prev) => prev.map((e) => (e.uid === uid ? { ...e, seen: true } : e)));
            }
        } catch { /* */ }
        setReadingLoading(false);
    };

    const handleDelete = async (uid: number) => {
        if (!confirm("Bu e-postayı silmek istediğinize emin misiniz?")) return;
        await fetch("/api/email/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid, folder }),
        });
        setSelectedEmail(null);
        setSelectedUid(null);
        fetchEmails();
    };

    const handleReply = (email: EmailFull) => {
        setReplyTo(email);
        setComposeTo([email.from.address]);
        setComposeSubject(`Re: ${email.subject.replace(/^Re:\s*/i, "")}`);
        setComposeBody("");
        setShowCompose(true);
    };

    const handleSend = async () => {
        if (composeTo.length === 0 || !composeSubject) return;
        setComposeSending(true);

        const htmlBody = bodyRef.current?.innerHTML || composeBody.replace(/\n/g, "<br>");

        try {
            const res = await fetch("/api/email/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "notification",
                    to: composeTo.join(", "),
                    title: composeSubject,
                    message: bodyRef.current?.innerText || composeBody,
                }),
            });
            const data = await res.json();
            if (data.success || data.messageId) {
                setShowCompose(false);
                resetCompose();
                alert("✅ E-posta gönderildi!");
            } else {
                alert("❌ Gönderilemedi: " + (data.error || "Bilinmeyen hata"));
            }
        } catch {
            alert("❌ Gönderilemedi.");
        }
        setComposeSending(false);
    };

    const resetCompose = () => {
        setComposeTo([]);
        setComposeToInput("");
        setComposeSubject("");
        setComposeBody("");
        setReplyTo(null);
        if (bodyRef.current) bodyRef.current.innerHTML = "";
    };

    const addToRecipient = () => {
        const trimmed = composeToInput.trim();
        if (trimmed && trimmed.includes("@") && !composeTo.includes(trimmed)) {
            setComposeTo([...composeTo, trimmed]);
            setComposeToInput("");
        }
    };

    const removeRecipient = (email: string) => {
        setComposeTo(composeTo.filter((e) => e !== email));
    };

    const formatDate = (d: string) => {
        if (!d) return "";
        const date = new Date(d);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        if (isToday) return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
        return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
    };

    const formatFullDate = (d: string) => {
        if (!d) return "";
        return new Date(d).toLocaleDateString("tr-TR", {
            day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
        });
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / 1048576).toFixed(1) + " MB";
    };

    const getInitial = (name: string, address: string) => {
        const n = name || address || "?";
        return n.charAt(0).toUpperCase();
    };

    const getAvatarColor = (str: string) => {
        const colors = [
            "bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-pink-500",
            "bg-orange-500", "bg-cyan-500", "bg-rose-500", "bg-indigo-500",
        ];
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    const unreadCount = emails.filter((e) => !e.seen).length;

    const filteredEmails = search
        ? emails.filter(
            (e) =>
                e.subject.toLowerCase().includes(search.toLowerCase()) ||
                e.from.name.toLowerCase().includes(search.toLowerCase()) ||
                e.from.address.toLowerCase().includes(search.toLowerCase())
        )
        : emails;

    const execCommand = (cmd: string, val?: string) => {
        document.execCommand(cmd, false, val);
        bodyRef.current?.focus();
    };

    return (
        <div className="flex -m-6 lg:-m-8 h-[calc(100vh-64px)]">
            {/* ── LEFT SIDEBAR ── */}
            <div className="w-56 flex-shrink-0 border-r border-white/5 flex flex-col p-4">
                <button
                    onClick={() => { resetCompose(); setShowCompose(true); }}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-sm py-3 rounded-xl transition-colors mb-6"
                >
                    <Mail className="w-4 h-4" />
                    E-posta Yaz
                </button>

                <nav className="flex-1 space-y-1">
                    {folders.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => { setFolder(f.key); setSelectedEmail(null); setSelectedUid(null); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${folder === f.key
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted hover:text-foreground hover:bg-white/5"
                                }`}
                        >
                            <f.icon className="w-4 h-4" />
                            <span className="flex-1 text-left">{f.label}</span>
                            {f.key === "INBOX" && unreadCount > 0 && (
                                <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Storage */}
                <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between text-[10px] text-muted mb-1.5">
                        <span>Depolama</span>
                        <span>15 GB</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "12%" }} />
                    </div>
                </div>
            </div>

            {/* ── MIDDLE: EMAIL LIST ── */}
            <div className="w-80 lg:w-96 flex-shrink-0 border-r border-white/5 flex flex-col">
                {/* List Header */}
                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold">
                            {folders.find((f) => f.key === folder)?.label || "Gelen Kutusu"}
                            {unreadCount > 0 && folder === "INBOX" && (
                                <span className="text-xs text-muted ml-2">({unreadCount} okunmamış)</span>
                            )}
                        </h2>
                        <button
                            onClick={handleRefresh}
                            className={`p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-foreground transition-colors ${refreshing ? "animate-spin" : ""}`}
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                        <input
                            type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="E-posta ara..."
                            className="w-full bg-[#111] border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs placeholder:text-muted/50 focus:outline-none focus:border-primary/30"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-sm text-muted">Yükleniyor...</div>
                    ) : filteredEmails.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted">E-posta bulunamadı.</div>
                    ) : (
                        filteredEmails.map((email) => (
                            <button
                                key={email.uid}
                                onClick={() => handleSelectEmail(email.uid)}
                                className={`w-full text-left px-4 py-3 border-b border-white/5 transition-colors ${selectedUid === email.uid ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-white/[0.02]"
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5 ${getAvatarColor(email.from.address)}`}>
                                        {getInitial(email.from.name, email.from.address)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`text-xs truncate ${!email.seen ? "font-bold text-foreground" : "text-muted"}`}>
                                                {email.from.name || email.from.address}
                                            </p>
                                            <span className="text-[10px] text-muted flex-shrink-0">{formatDate(email.date)}</span>
                                        </div>
                                        <p className={`text-xs truncate mt-0.5 ${!email.seen ? "font-semibold text-foreground" : "text-muted"}`}>
                                            {email.subject}
                                        </p>
                                    </div>

                                    {/* Unread dot */}
                                    {!email.seen && (
                                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* ── RIGHT: READING PANE ── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {readingLoading ? (
                    <div className="flex-1 flex items-center justify-center text-sm text-muted">Yükleniyor...</div>
                ) : !selectedEmail ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted">
                        <Mail className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-sm">Okumak için bir e-posta seçin</p>
                    </div>
                ) : (
                    <>
                        {/* Email Header */}
                        <div className="p-6 border-b border-white/5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h2 className="text-lg font-bold mb-3">{selectedEmail.subject}</h2>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(selectedEmail.from.address)}`}>
                                            {getInitial(selectedEmail.from.name, selectedEmail.from.address)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {selectedEmail.from.name || selectedEmail.from.address}
                                                <span className="text-xs text-muted ml-2">&lt;{selectedEmail.from.address}&gt;</span>
                                            </p>
                                            <p className="text-[11px] text-muted">
                                                Kime: {selectedEmail.to.map((t) => t.address).join(", ")}
                                                {selectedEmail.cc.length > 0 && ` | CC: ${selectedEmail.cc.map((c) => c.address).join(", ")}`}
                                            </p>
                                            <p className="text-[10px] text-muted mt-0.5">{formatFullDate(selectedEmail.date)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleReply(selectedEmail)}
                                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                                    >
                                        Yanıtla
                                    </button>
                                    <button
                                        onClick={() => handleDelete(selectedEmail.uid)}
                                        className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Email Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {selectedEmail.html ? (
                                <div
                                    className="prose prose-invert prose-sm max-w-none [&_*]:!text-inherit [&_a]:!text-primary"
                                    style={{ color: "var(--color-muted)" }}
                                    dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                                />
                            ) : (
                                <pre className="text-sm text-muted whitespace-pre-wrap font-sans leading-relaxed">{selectedEmail.text}</pre>
                            )}

                            {/* Attachments */}
                            {selectedEmail.attachments.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-white/5">
                                    <p className="text-xs text-muted uppercase mb-3">Ekler ({selectedEmail.attachments.length})</p>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                        {selectedEmail.attachments.map((att, i) => (
                                            <a
                                                key={i}
                                                href={`data:${att.contentType};base64,${att.contentBase64}`}
                                                download={att.filename}
                                                className="flex items-center gap-3 bg-[#111] border border-white/5 rounded-xl p-3 hover:border-primary/30 transition-colors group"
                                            >
                                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <FileText className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{att.filename}</p>
                                                    <p className="text-[10px] text-muted">{formatSize(att.size)}</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ── COMPOSE MODAL ── */}
            {showCompose && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
                    <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl flex flex-col max-h-[80vh] shadow-2xl">
                        {/* Compose Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                            <h3 className="text-sm font-bold">{replyTo ? "Yanıtla" : "Yeni E-posta"}</h3>
                            <button onClick={() => { setShowCompose(false); resetCompose(); }} className="text-muted hover:text-foreground">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Compose Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                            {/* From */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-muted w-12">Kimden</span>
                                <div className="flex items-center gap-2 text-xs text-muted bg-white/5 px-3 py-1.5 rounded-lg">
                                    info@aksedigital.com <ChevronDown className="w-3 h-3" />
                                </div>
                            </div>

                            {/* To */}
                            <div className="flex items-start gap-3">
                                <span className="text-xs text-muted w-12 pt-2">Kime</span>
                                <div className="flex-1 flex flex-wrap items-center gap-1.5 bg-white/5 rounded-lg px-3 py-2 min-h-[36px]">
                                    {composeTo.map((email) => (
                                        <span key={email} className="flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-0.5 text-xs">
                                            {email}
                                            <button onClick={() => removeRecipient(email)} className="text-muted hover:text-red-400">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="email"
                                        value={composeToInput}
                                        onChange={(e) => setComposeToInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === "," || e.key === " ") {
                                                e.preventDefault();
                                                addToRecipient();
                                            }
                                        }}
                                        onBlur={addToRecipient}
                                        placeholder={composeTo.length === 0 ? "E-posta adresi..." : ""}
                                        className="flex-1 min-w-[120px] bg-transparent text-xs focus:outline-none placeholder:text-muted/40"
                                    />
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-muted w-12">Konu</span>
                                <input
                                    type="text"
                                    value={composeSubject}
                                    onChange={(e) => setComposeSubject(e.target.value)}
                                    placeholder="Konu..."
                                    className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-xs focus:outline-none placeholder:text-muted/40"
                                />
                            </div>

                            {/* Toolbar */}
                            <div className="flex items-center gap-1 pt-2 border-t border-white/5">
                                <button onClick={() => execCommand("bold")} className="p-1.5 rounded hover:bg-white/5 text-muted hover:text-foreground" title="Kalın"><Bold className="w-3.5 h-3.5" /></button>
                                <button onClick={() => execCommand("italic")} className="p-1.5 rounded hover:bg-white/5 text-muted hover:text-foreground" title="İtalik"><Italic className="w-3.5 h-3.5" /></button>
                                <button onClick={() => { const url = prompt("URL:"); if (url) execCommand("createLink", url); }} className="p-1.5 rounded hover:bg-white/5 text-muted hover:text-foreground" title="Link"><Link2 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => execCommand("insertUnorderedList")} className="p-1.5 rounded hover:bg-white/5 text-muted hover:text-foreground" title="Liste"><List className="w-3.5 h-3.5" /></button>
                            </div>

                            {/* Editor */}
                            <div
                                ref={bodyRef}
                                contentEditable
                                className="min-h-[200px] bg-white/5 rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                                style={{ whiteSpace: "pre-wrap" }}
                                suppressContentEditableWarning
                            />
                        </div>

                        {/* Compose Footer */}
                        <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <button onClick={() => { setShowCompose(false); resetCompose(); }} className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors" title="Sil">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-foreground transition-colors" title="Dosya ekle">
                                    <Paperclip className="w-4 h-4" />
                                </button>
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={composeSending || composeTo.length === 0}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors disabled:opacity-40"
                            >
                                <SendIcon className="w-4 h-4" />
                                {composeSending ? "Gönderiliyor..." : "Gönder"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
