"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    MessageCircle,
    FileText,
    BookOpen,
    SendHorizontal,
    Mail,
    HardDrive,
    TrendingUp,
    CalendarDays,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Bell,
    Globe,
} from "lucide-react";

const sidebarLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/teklifler", label: "Teklifler", icon: FileText },
    { href: "/admin/teklifler-gonder", label: "Teklif Gönder", icon: SendHorizontal },
    { href: "/admin/eposta", label: "E-posta", icon: Mail },
    { href: "/admin/drive", label: "Google Drive", icon: HardDrive },
    { href: "/admin/finans", label: "Finans", icon: TrendingUp },
    { href: "/admin/takvim", label: "Takvim", icon: CalendarDays },
    { href: "/admin/analitik", label: "Analitik", icon: BarChart3 },
    { href: "/admin/blog", label: "Blog", icon: BookOpen },
    { href: "/admin/musteriler", label: "Müşteriler", icon: Users },
    { href: "/admin/mesajlar", label: "Mesajlar", icon: MessageSquare },
    { href: "/admin/meta-mesajlar", label: "Meta Mesajlar", icon: MessageCircle },
    { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings },
];

const languages = [
    { code: "tr", label: "Türkçe", flag: "🇹🇷" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

interface Notification {
    id: string;
    type: "quote" | "contact";
    title: string;
    description: string;
    time: string;
    read: boolean;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<{ name?: string; phone?: string; email?: string; avatar_url?: string } | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotif, setShowNotif] = useState(false);
    const [showLang, setShowLang] = useState(false);
    const [currentLang, setCurrentLang] = useState("tr");
    const notifRef = useRef<HTMLDivElement>(null);
    const langRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "me" }) })
            .then(r => r.json())
            .then(d => { if (d.success) setUser(d.user); });
    }, []);

    // Fetch unread notifications
    const fetchNotifications = async () => {
        const [quotesRes, contactsRes] = await Promise.all([
            supabase.from("quotes").select("id, name, services, created_at, status").eq("status", "new").order("created_at", { ascending: false }).limit(5),
            supabase.from("contacts").select("id, name, subject, created_at, is_read").eq("is_read", false).order("created_at", { ascending: false }).limit(5),
        ]);

        const notifs: Notification[] = [];

        (quotesRes.data || []).forEach((q: { id: string; name: string; services: string[]; created_at: string }) => {
            notifs.push({
                id: q.id,
                type: "quote",
                title: `Yeni Teklif: ${q.name}`,
                description: q.services?.slice(0, 2).join(", ") || "Teklif talebi",
                time: q.created_at,
                read: false,
            });
        });

        (contactsRes.data || []).forEach((c: { id: string; name: string; subject: string; created_at: string }) => {
            notifs.push({
                id: c.id,
                type: "contact",
                title: `Yeni Mesaj: ${c.name}`,
                description: c.subject || "İletişim mesajı",
                time: c.created_at,
                read: false,
            });
        });

        notifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setNotifications(notifs);
    };

    useEffect(() => {
        fetchNotifications();

        // Realtime subscriptions
        const quotesChannel = supabase
            .channel("quotes-realtime")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "quotes" }, () => {
                fetchNotifications();
            })
            .subscribe();

        const contactsChannel = supabase
            .channel("contacts-realtime")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "contacts" }, () => {
                fetchNotifications();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(quotesChannel);
            supabase.removeChannel(contactsChannel);
        };
    }, []);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
            if (langRef.current && !langRef.current.contains(e.target as Node)) setShowLang(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleLogout = async () => {
        await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
        router.push("/login");
        router.refresh();
    };

    const unreadCount = notifications.length;

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Az önce";
        if (mins < 60) return `${mins} dk`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} sa`;
        return `${Math.floor(hours / 24)} gün`;
    };

    const selectedLang = languages.find((l) => l.code === currentLang) || languages[0];

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex" style={{ cursor: "default" }}>
            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#0f0f0f] border-r border-white/5 z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
                    <Link href="/admin" className="text-xl font-extrabold">
                        AKSE<span className="text-primary">.</span>
                        <span className="text-xs font-normal text-muted ml-2">Admin</span>
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted hover:text-foreground hover:bg-white/5"
                                    }`}
                            >
                                <link.icon className="w-4 h-4" />
                                {link.label}
                                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary overflow-hidden">
                            {user?.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : (user?.name?.charAt(0).toUpperCase() || "A")}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{user?.name || "Admin"}</p>
                            <p className="text-[10px] text-muted">{user?.phone || "Yönetici"}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Çıkış Yap
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="h-16 border-b border-white/5 flex items-center px-6 gap-4 bg-[#0a0a0a] sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-muted hover:text-foreground"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex-1" />

                    {/* Language Selector */}
                    <div className="relative" ref={langRef}>
                        <button
                            onClick={() => { setShowLang(!showLang); setShowNotif(false); }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-foreground hover:bg-white/5 transition-colors"
                        >
                            <Globe className="w-4 h-4" />
                            <span>{selectedLang.flag} {selectedLang.label}</span>
                        </button>
                        {showLang && (
                            <div className="absolute right-0 top-full mt-2 w-40 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => { setCurrentLang(lang.code); setShowLang(false); }}
                                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-white/5 transition-colors ${currentLang === lang.code ? "text-primary" : "text-muted"
                                            }`}
                                    >
                                        <span>{lang.flag}</span>
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notifications */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => { setShowNotif(!showNotif); setShowLang(false); }}
                            className="relative p-2 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>
                        {showNotif && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                                    <span className="text-sm font-bold">Bildirimler</span>
                                    {unreadCount > 0 && (
                                        <span className="text-xs text-primary">{unreadCount} yeni</span>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="px-4 py-8 text-center text-xs text-muted">
                                            Yeni bildirim yok
                                        </div>
                                    ) : (
                                        notifications.map((n) => (
                                            <Link
                                                key={n.id}
                                                href={n.type === "quote" ? "/admin/teklifler" : "/admin/mesajlar"}
                                                onClick={() => setShowNotif(false)}
                                                className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.type === "quote" ? "bg-blue-500/10" : "bg-purple-500/10"
                                                    }`}>
                                                    {n.type === "quote" ? (
                                                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                                                    ) : (
                                                        <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium truncate">{n.title}</p>
                                                    <p className="text-[10px] text-muted truncate">{n.description}</p>
                                                </div>
                                                <span className="text-[10px] text-muted flex-shrink-0">
                                                    {timeAgo(n.time)}
                                                </span>
                                            </Link>
                                        ))
                                    )}
                                </div>
                                {notifications.length > 0 && (
                                    <Link
                                        href="/admin/teklifler"
                                        onClick={() => setShowNotif(false)}
                                        className="block text-center text-xs text-primary py-2.5 border-t border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        Tümünü Gör
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Site Link */}
                    <Link
                        href="/"
                        target="_blank"
                        className="text-xs text-muted hover:text-primary transition-colors hidden sm:block"
                    >
                        Siteyi Görüntüle →
                    </Link>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 lg:p-8" style={{ cursor: "default" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
