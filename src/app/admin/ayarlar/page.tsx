"use client";

import { useState, useEffect } from "react";
import { Settings, User, Globe, MessageCircle, Save, Check, Eye, EyeOff, Camera } from "lucide-react";

interface AuthUser {
    id: string; phone: string; name: string; email: string; avatar_url: string; role: string;
}

const META_FIELDS = [
    { key: "app_id", label: "Meta App ID", placeholder: "123456789..." },
    { key: "app_secret", label: "Meta App Secret", placeholder: "abc123..." },
    { key: "page_access_token", label: "Page Access Token", placeholder: "EAA..." },
    { key: "whatsapp_token", label: "WhatsApp Token", placeholder: "EAA..." },
    { key: "whatsapp_phone_id", label: "WhatsApp Phone ID", placeholder: "123456789..." },
    { key: "webhook_verify_token", label: "Webhook Verify Token", placeholder: "custom-secret-key" },
    { key: "instagram_id", label: "Instagram Business ID", placeholder: "123456789..." },
];

const SITE_FIELDS = [
    { key: "site_name", value: "Akse Digital", label: "Site Adı" },
    { key: "site_description", value: "Gebze merkezli dijital ajans", label: "Site Açıklaması" },
    { key: "phone", value: "+90 555 000 0000", label: "Telefon" },
    { key: "email", value: "info@aksedigital.com", label: "E-posta" },
    { key: "address", value: "Gebze, Kocaeli, Türkiye", label: "Adres" },
    { key: "instagram", value: "https://instagram.com/aksedigital", label: "Instagram" },
    { key: "whatsapp", value: "+905550000000", label: "WhatsApp Numarası" },
];

export default function AyarlarPage() {
    const [tab, setTab] = useState<"profile" | "site" | "meta">("profile");
    const [user, setUser] = useState<AuthUser | null>(null);
    const [profileForm, setProfileForm] = useState({ name: "", email: "", avatar_url: "" });
    const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
    const [showPass, setShowPass] = useState(false);
    const [siteSettings, setSiteSettings] = useState(SITE_FIELDS.map(f => ({ ...f })));
    const [metaSettings, setMetaSettings] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            // Get current user
            const meRes = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "me" }) });
            const meData = await meRes.json();
            if (meData.success && meData.user) {
                setUser(meData.user);
                setProfileForm({ name: meData.user.name, email: meData.user.email, avatar_url: meData.user.avatar_url });
            }

            // Get site settings
            try {
                const res = await fetch("/api/settings");
                const data = await res.json();
                if (data && Array.isArray(data)) {
                    setSiteSettings(prev => prev.map(s => {
                        const found = data.find((d: { key: string; value: string }) => d.key === s.key);
                        return found ? { ...s, value: found.value } : s;
                    }));
                    // Get meta settings
                    const meta: Record<string, string> = {};
                    data.forEach((d: { key: string; value: string }) => {
                        if (d.key.startsWith("meta_")) meta[d.key.replace("meta_", "")] = d.value;
                    });
                    setMetaSettings(meta);
                }
            } catch { /* ignore */ }
            setLoading(false);
        })();
    }, []);

    const saveProfile = async () => {
        setSaving(true);
        await fetch("/api/auth", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "update_profile", ...profileForm }),
        });
        setSaving(false);
        setSaved("profile");
        setTimeout(() => setSaved(""), 2000);
    };

    const changePassword = async () => {
        if (passwordForm.new !== passwordForm.confirm) return alert("Şifreler eşleşmiyor");
        if (passwordForm.new.length < 6) return alert("Şifre en az 6 karakter olmalı");
        setSaving(true);
        const res = await fetch("/api/auth", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "change_password", current_password: passwordForm.current, new_password: passwordForm.new }),
        });
        const data = await res.json();
        setSaving(false);
        if (data.success) {
            setSaved("password");
            setPasswordForm({ current: "", new: "", confirm: "" });
            setTimeout(() => setSaved(""), 2000);
        } else {
            alert(data.error);
        }
    };

    const saveSiteSettings = async () => {
        setSaving(true);
        for (const s of siteSettings) {
            await fetch("/api/settings", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: s.key, value: s.value }),
            });
        }
        setSaving(false);
        setSaved("site");
        setTimeout(() => setSaved(""), 2000);
    };

    const saveMetaSettings = async () => {
        setSaving(true);
        await fetch("/api/auth", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "save_meta_settings", settings: metaSettings }),
        });
        setSaving(false);
        setSaved("meta");
        setTimeout(() => setSaved(""), 2000);
    };

    const TABS = [
        { key: "profile", label: "Profil", icon: User },
        { key: "site", label: "Site Ayarları", icon: Globe },
        { key: "meta", label: "Meta API", icon: MessageCircle },
    ] as const;

    if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-muted" />
                </div>
                <div>
                    <h1 className="text-xl font-extrabold">Ayarlar</h1>
                    <p className="text-xs text-muted">Profil, site ve entegrasyon ayarları</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white/5 rounded-xl p-0.5 w-fit">
                {TABS.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`flex items-center gap-2 px-4 py-2 text-xs rounded-lg transition-colors ${tab === t.key ? "bg-white/10 font-medium" : "text-muted hover:text-foreground"}`}>
                        <t.icon className="w-3.5 h-3.5" /> {t.label}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {tab === "profile" && (
                <div className="space-y-6">
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                        <h3 className="font-bold mb-4">Profil Bilgileri</h3>
                        <div className="flex items-start gap-6">
                            {/* Avatar */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border-2 border-white/10">
                                    {profileForm.avatar_url ? (
                                        <img src={profileForm.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 text-muted" />
                                    )}
                                </div>
                                <label className="text-[10px] text-primary cursor-pointer hover:underline flex items-center gap-1">
                                    <Camera className="w-3 h-3" /> Değiştir
                                    <input type="text" className="hidden" />
                                </label>
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <label className="text-[11px] text-muted mb-1 block">Ad Soyad</label>
                                    <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                                </div>
                                <div>
                                    <label className="text-[11px] text-muted mb-1 block">E-posta</label>
                                    <input value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                                </div>
                                <div>
                                    <label className="text-[11px] text-muted mb-1 block">Telefon</label>
                                    <input value={user?.phone || ""} disabled
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-muted cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="text-[11px] text-muted mb-1 block">Profil Fotoğrafı URL</label>
                                    <input value={profileForm.avatar_url} onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                                        placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                                </div>
                                <button onClick={saveProfile} disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl disabled:opacity-50">
                                    {saved === "profile" ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                    {saved === "profile" ? "Kaydedildi" : "Profili Kaydet"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                        <h3 className="font-bold mb-4">Şifre Değiştir</h3>
                        <div className="space-y-3 max-w-md">
                            <div>
                                <label className="text-[11px] text-muted mb-1 block">Mevcut Şifre</label>
                                <div className="relative">
                                    <input type={showPass ? "text" : "password"} value={passwordForm.current}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                                        {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] text-muted mb-1 block">Yeni Şifre</label>
                                <input type="password" value={passwordForm.new}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                            </div>
                            <div>
                                <label className="text-[11px] text-muted mb-1 block">Yeni Şifre (Tekrar)</label>
                                <input type="password" value={passwordForm.confirm}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                            </div>
                            <button onClick={changePassword} disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl disabled:opacity-50">
                                {saved === "password" ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                {saved === "password" ? "Değiştirildi" : "Şifreyi Değiştir"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Site Settings Tab */}
            {tab === "site" && (
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold">Site Ayarları</h3>
                        <button onClick={saveSiteSettings} disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl disabled:opacity-50">
                            {saved === "site" ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            {saved === "site" ? "Kaydedildi" : "Kaydet"}
                        </button>
                    </div>
                    <div className="space-y-4">
                        {siteSettings.map(s => (
                            <div key={s.key}>
                                <label className="text-[11px] text-muted mb-1 block">{s.label}</label>
                                <input value={s.value} onChange={(e) => setSiteSettings(prev => prev.map(p => p.key === s.key ? { ...p, value: e.target.value } : p))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Meta API Tab */}
            {tab === "meta" && (
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold">Meta API Ayarları</h3>
                            <p className="text-[11px] text-muted mt-1">WhatsApp, Messenger ve Instagram entegrasyonu için token&apos;larınızı girin</p>
                        </div>
                        <button onClick={saveMetaSettings} disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl disabled:opacity-50">
                            {saved === "meta" ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            {saved === "meta" ? "Kaydedildi" : "Kaydet"}
                        </button>
                    </div>
                    <div className="space-y-4">
                        {META_FIELDS.map(f => (
                            <div key={f.key}>
                                <label className="text-[11px] text-muted mb-1 block">{f.label}</label>
                                <input value={metaSettings[f.key] || ""} onChange={(e) => setMetaSettings({ ...metaSettings, [f.key]: e.target.value })}
                                    placeholder={f.placeholder}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30 font-mono" />
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                        <p className="text-[11px] text-blue-400">
                            💡 Webhook URL: <code className="bg-white/5 px-1.5 py-0.5 rounded">https://siteniz.com/api/meta/webhook</code>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
