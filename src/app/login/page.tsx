"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Phone, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "admin_login", phone, password }),
        });
        const data = await res.json();

        if (!data.success) {
            setError(data.error || "Giriş başarısız");
            setLoading(false);
            return;
        }

        router.push("/admin");
        router.refresh();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] px-6">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        AKSE<span className="text-primary">.</span>
                    </h1>
                    <p className="text-muted text-sm mt-2">Yönetim Paneline Giriş</p>
                </div>

                {/* Login Card */}
                <div className="bg-card border border-border rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-bold">Giriş Yap</h2>
                            <p className="text-xs text-muted">Telefon ve şifrenizle giriş yapın</p>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs text-muted uppercase tracking-widest mb-2">
                                Telefon
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                                    placeholder="05XX XXX XX XX"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-muted uppercase tracking-widest mb-2">
                                Şifre
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-background border border-border rounded-xl pl-11 pr-11 py-3.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <a href="/portal/giris" className="text-xs text-muted hover:text-primary transition-colors">
                            Müşteri girişi →
                        </a>
                    </div>
                </div>

                <p className="text-center text-xs text-muted mt-6">
                    © 2026 Akse Digital. Yönetim Paneli
                </p>
            </div>
        </div>
    );
}
