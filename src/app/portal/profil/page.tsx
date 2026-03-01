"use client";

import { useState, useEffect } from "react";
import { User, Save, Check, Eye, EyeOff } from "lucide-react";

export default function PortalProfilPage() {
    const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", avatar_url: "" });
    const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
    const [showPass, setShowPass] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "me" }) })
            .then(r => r.json())
            .then(d => { if (d.success) setForm({ name: d.user.name, email: d.user.email, phone: d.user.phone, company: "", avatar_url: d.user.avatar_url || "" }); setLoading(false); });
    }, []);

    const saveProfile = async () => {
        setSaving(true);
        await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update_profile", name: form.name, email: form.email, avatar_url: form.avatar_url }) });
        setSaving(false); setSaved("profile"); setTimeout(() => setSaved(""), 2000);
    };

    const changePassword = async () => {
        if (passwordForm.new !== passwordForm.confirm) return alert("Şifreler eşleşmiyor");
        setSaving(true);
        const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "change_password", current_password: passwordForm.current, new_password: passwordForm.new }) });
        const d = await r.json(); setSaving(false);
        if (d.success) { setSaved("password"); setPasswordForm({ current: "", new: "", confirm: "" }); setTimeout(() => setSaved(""), 2000); }
        else alert(d.error);
    };

    if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-extrabold">Profilim</h1>

            <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center overflow-hidden border-2 border-white/10">
                        {form.avatar_url ? <img src={form.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-emerald-400" />}
                    </div>
                    <div className="flex-1 space-y-3">
                        {[
                            { key: "name", label: "Ad Soyad" },
                            { key: "email", label: "E-posta" },
                            { key: "avatar_url", label: "Profil Fotoğrafı URL" },
                        ].map(f => (
                            <div key={f.key}>
                                <label className="text-[11px] text-muted mb-1 block">{f.label}</label>
                                <input value={form[f.key as keyof typeof form]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                            </div>
                        ))}
                        <div>
                            <label className="text-[11px] text-muted mb-1 block">Telefon</label>
                            <input value={form.phone} disabled className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-muted cursor-not-allowed" />
                        </div>
                        <button onClick={saveProfile} disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl disabled:opacity-50">
                            {saved === "profile" ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            {saved === "profile" ? "Kaydedildi" : "Kaydet"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                <h3 className="font-bold mb-4">Şifre Değiştir</h3>
                <div className="space-y-3 max-w-md">
                    <div className="relative">
                        <label className="text-[11px] text-muted mb-1 block">Mevcut Şifre</label>
                        <input type={showPass ? "text" : "password"} value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-8 text-muted">
                            {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                    <div>
                        <label className="text-[11px] text-muted mb-1 block">Yeni Şifre</label>
                        <input type="password" value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                    </div>
                    <div>
                        <label className="text-[11px] text-muted mb-1 block">Yeni Şifre (Tekrar)</label>
                        <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
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
    );
}
