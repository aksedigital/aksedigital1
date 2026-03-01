"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, FileText, FolderOpen, User, LogOut } from "lucide-react";

interface PortalUser {
    id: string; name: string; phone: string; email: string; company?: string; avatar_url?: string;
}

const portalLinks = [
    { href: "/portal", label: "Panel", icon: LayoutDashboard },
    { href: "/portal/teklifler", label: "Teklifler", icon: FileText },
    { href: "/portal/dosyalar", label: "Dosyalar", icon: FolderOpen },
    { href: "/portal/profil", label: "Profil", icon: User },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<PortalUser | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "me" }) })
            .then(r => r.json())
            .then(d => { if (d.success) setUser(d.user); });
    }, []);

    const handleLogout = async () => {
        await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
        router.push("/portal/giris");
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-[#050505] text-foreground">
            {/* Top Bar */}
            <header className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
                    <div className="flex items-center gap-6">
                        <h1 className="text-lg font-extrabold tracking-tight">AKSE<span className="text-primary">.</span></h1>
                        <nav className="flex items-center gap-1">
                            {portalLinks.map(link => {
                                const isActive = pathname === link.href;
                                return (
                                    <a key={link.href} href={link.href}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${isActive ? "bg-white/10 font-medium" : "text-muted hover:text-foreground hover:bg-white/5"}`}>
                                        <link.icon className="w-3.5 h-3.5" /> {link.label}
                                    </a>
                                );
                            })}
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        {user && (
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : <User className="w-3.5 h-3.5 text-emerald-400" />}
                                </div>
                                <span className="text-xs font-medium hidden sm:block">{user.name}</span>
                            </div>
                        )}
                        <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-red-400">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6">
                {children}
            </main>
        </div>
    );
}
