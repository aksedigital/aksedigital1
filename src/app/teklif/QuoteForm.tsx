"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Send, Check } from "lucide-react";

const serviceOptions = [
    "Web Tasarım",
    "Mobil Uygulama",
    "SEO",
    "Sosyal Medya",
    "E-Ticaret",
    "Grafik Tasarım",
    "Dijital Pazarlama",
    "Diğer",
];

const budgetOptions = [
    "10.000 ₺ - 25.000 ₺",
    "25.000 ₺ - 50.000 ₺",
    "50.000 ₺ - 100.000 ₺",
    "100.000 ₺+",
    "Bütçem belirsiz",
];

const steps = ["Kişisel Bilgiler", "Hizmet Seçimi", "Proje Detayları", "Bütçe & Gönderim"];

export function QuoteForm() {
    const [step, setStep] = useState(0);
    const [sent, setSent] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        services: [] as string[],
        projectDesc: "",
        deadline: "",
        budget: "",
    });

    const toggleService = (s: string) => {
        setFormData((prev) => ({
            ...prev,
            services: prev.services.includes(s)
                ? prev.services.filter((x) => x !== s)
                : [...prev.services, s],
        }));
    };

    const handleSubmit = async () => {
        setSent(true);
    };

    if (sent) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 rounded-2xl border border-primary/30 bg-primary/5 text-center"
            >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Teklif Talebiniz Alındı!</h3>
                <p className="text-muted text-sm">24 saat içinde size dönüş yapacağız.</p>
            </motion.div>
        );
    }

    return (
        <div>
            {/* Stepper */}
            <div className="flex items-center justify-between mb-12">
                {steps.map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${i <= step
                                    ? "bg-primary text-white"
                                    : "bg-card border border-border text-muted"
                                }`}
                        >
                            {i < step ? <Check className="w-4 h-4" /> : i + 1}
                        </div>
                        <span className="hidden md:inline text-xs text-muted">{s}</span>
                        {i < steps.length - 1 && (
                            <div
                                className={`hidden md:block w-12 lg:w-20 h-px mx-2 transition-colors duration-300 ${i < step ? "bg-primary" : "bg-border"
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Steps */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {step === 0 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs text-muted uppercase tracking-widest mb-2">
                                        Ad Soyad *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="hoverable w-full bg-card border border-border rounded-xl px-5 py-4 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="Adınız Soyadınız"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-muted uppercase tracking-widest mb-2">
                                        E-posta *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="hoverable w-full bg-card border border-border rounded-xl px-5 py-4 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="ornek@email.com"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs text-muted uppercase tracking-widest mb-2">
                                        Telefon
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="hoverable w-full bg-card border border-border rounded-xl px-5 py-4 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="+90 5XX XXX XX XX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-muted uppercase tracking-widest mb-2">
                                        Şirket
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="hoverable w-full bg-card border border-border rounded-xl px-5 py-4 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="Şirket adınız (opsiyonel)"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div>
                            <p className="text-sm text-muted mb-6">
                                Hangi hizmetlerle ilgileniyorsunuz? (Birden fazla seçebilirsiniz)
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {serviceOptions.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => toggleService(s)}
                                        className={`hoverable p-4 rounded-xl border text-sm font-medium text-center transition-all duration-300 ${formData.services.includes(s)
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border bg-card text-muted hover:border-primary/30"
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs text-muted uppercase tracking-widest mb-2">
                                    Proje açıklaması
                                </label>
                                <textarea
                                    rows={5}
                                    value={formData.projectDesc}
                                    onChange={(e) => setFormData({ ...formData, projectDesc: e.target.value })}
                                    className="hoverable w-full bg-card border border-border rounded-xl px-5 py-4 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                                    placeholder="Projenizi kısaca anlatın. Hedefleriniz, referans siteler vb."
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-muted uppercase tracking-widest mb-2">
                                    Termin tarihi
                                </label>
                                <input
                                    type="text"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    className="hoverable w-full bg-card border border-border rounded-xl px-5 py-4 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                                    placeholder="Örn: 1 ay, 3 ay, acil yok"
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <p className="text-sm text-muted mb-6">Tahmini bütçeniz nedir?</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                                {budgetOptions.map((b) => (
                                    <button
                                        key={b}
                                        onClick={() => setFormData({ ...formData, budget: b })}
                                        className={`hoverable p-4 rounded-xl border text-sm font-medium text-left transition-all duration-300 ${formData.budget === b
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border bg-card text-muted hover:border-primary/30"
                                            }`}
                                    >
                                        {b}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10">
                {step > 0 ? (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="hoverable flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Geri
                    </button>
                ) : (
                    <div />
                )}

                {step < steps.length - 1 ? (
                    <button
                        onClick={() => setStep(step + 1)}
                        className="hoverable magnetic-btn text-white"
                    >
                        Devam
                        <ArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        className="hoverable magnetic-btn text-white"
                    >
                        Gönder
                        <Send className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
