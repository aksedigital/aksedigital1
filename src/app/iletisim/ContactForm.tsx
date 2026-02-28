"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function ContactForm() {
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSending(true);
        const formData = new FormData(e.currentTarget);
        try {
            const res = await fetch("/api/iletisim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.get("name"),
                    email: formData.get("email"),
                    phone: formData.get("phone"),
                    subject: formData.get("subject"),
                    message: formData.get("message"),
                }),
            });
            if (res.ok) setSent(true);
        } catch {
            // silent fail
        }
        setSending(false);
    };

    if (sent) {
        return (
            <div className="p-12 rounded-2xl border border-primary/30 bg-primary/5 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Mesajınız Gönderildi!</h3>
                <p className="text-muted text-sm">En kısa sürede size dönüş yapacağız.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="block text-xs text-muted uppercase tracking-widest mb-2">
                        Ad Soyad
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="hoverable w-full bg-card border border-border rounded-xl px-5 py-4 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="Adınız Soyadınız"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-xs text-muted uppercase tracking-widest mb-2">
                        E-posta
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="hoverable w-full bg-card border border-border rounded-xl px-5 py-4 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="ornek@email.com"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="phone" className="block text-xs text-muted uppercase tracking-widest mb-2">
                    Telefon
                </label>
                <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="hoverable w-full bg-card border border-border rounded-xl px-5 py-4 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="+90 5XX XXX XX XX"
                />
            </div>
            <div>
                <label htmlFor="subject" className="block text-xs text-muted uppercase tracking-widest mb-2">
                    Konu
                </label>
                <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    className="hoverable w-full bg-card border border-border rounded-xl px-5 py-4 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="Ne konuda yardımcı olabiliriz?"
                />
            </div>
            <div>
                <label htmlFor="message" className="block text-xs text-muted uppercase tracking-widest mb-2">
                    Mesaj
                </label>
                <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="hoverable w-full bg-card border border-border rounded-xl px-5 py-4 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    placeholder="Projeniz veya sorunuz hakkında detay yazın..."
                />
            </div>
            <button
                type="submit"
                disabled={sending}
                className="hoverable magnetic-btn text-white w-full md:w-auto disabled:opacity-50"
            >
                {sending ? "Gönderiliyor..." : "Gönder"}
                <Send className="w-4 h-4" />
            </button>
        </form>
    );
}
