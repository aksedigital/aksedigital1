"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Save, Check } from "lucide-react";

interface Setting {
    key: string;
    value: string;
    label: string;
}

const defaultSettings: Setting[] = [
    { key: "site_name", value: "Akse Digital", label: "Site Adı" },
    { key: "site_description", value: "Gebze merkezli dijital ajans", label: "Site Açıklaması" },
    { key: "phone", value: "+90 555 000 0000", label: "Telefon" },
    { key: "email", value: "info@aksedigital.com", label: "E-posta" },
    { key: "address", value: "Gebze, Kocaeli, Türkiye", label: "Adres" },
    { key: "instagram", value: "https://instagram.com/aksedigital", label: "Instagram" },
    { key: "whatsapp", value: "+905550000000", label: "WhatsApp Numarası" },
];

export default function AyarlarPage() {
    const [settings, setSettings] = useState<Setting[]>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        async function fetchSettings() {
            const { data } = await supabase.from("settings").select("*");
            if (data && data.length > 0) {
                setSettings((prev) =>
                    prev.map((s) => {
                        const found = data.find((d: { key: string; value: string }) => d.key === s.key);
                        return found ? { ...s, value: found.value } : s;
                    })
                );
            }
            setLoading(false);
        }
        fetchSettings();
    }, [supabase]);

    const handleSave = async () => {
        setSaving(true);
        for (const setting of settings) {
            await supabase
                .from("settings")
                .upsert({ key: setting.key, value: setting.value }, { onConflict: "key" });
        }
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const updateSetting = (key: string, value: string) => {
        setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Ayarlar</h1>
                    <p className="text-sm text-muted mt-1">Site genel ayarlarını yönetin.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                >
                    {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? "Kaydedildi" : saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
            </div>

            <div className="bg-[#111] border border-white/5 rounded-xl p-6">
                {loading ? (
                    <div className="text-center py-12 text-muted">Yükleniyor...</div>
                ) : (
                    <div className="space-y-5">
                        {settings.map((setting) => (
                            <div key={setting.key}>
                                <label className="block text-xs text-muted uppercase tracking-widest mb-1.5">
                                    {setting.label}
                                </label>
                                <input
                                    type="text"
                                    value={setting.value}
                                    onChange={(e) => updateSetting(setting.key, e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
