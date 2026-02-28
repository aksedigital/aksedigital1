import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
    title: "İletişim | Gebze Dijital Ajans",
    description:
        "Akse Digital ile iletişime geçin. Gebze, Kocaeli'de web tasarım, mobil uygulama ve dijital pazarlama hizmetleri için bize ulaşın.",
};

const contactInfo = [
    { icon: MapPin, label: "Adres", value: "Gebze, Kocaeli, Türkiye" },
    { icon: Phone, label: "Telefon", value: "+90 555 000 0000", href: "tel:+905550000000" },
    { icon: Mail, label: "E-posta", value: "info@aksedigital.com", href: "mailto:info@aksedigital.com" },
    { icon: Clock, label: "Çalışma Saatleri", value: "Pzt - Cuma: 09:00 - 18:00" },
];

export default function IletisimPage() {
    return (
        <>
            <section className="pt-32 pb-20 md:pt-40 md:pb-32">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <Reveal>
                        <p className="text-muted text-sm font-medium uppercase tracking-widest mb-4">
                            İletişim
                        </p>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[0.95]">
                            Bizimle <span className="text-primary">İletişime</span> Geçin
                        </h1>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <p className="text-muted text-lg md:text-xl max-w-2xl mt-8 leading-relaxed">
                            Projeniz, sorunuz veya iş birliği için bize yazın. En kısa sürede
                            size dönüş yapacağız.
                        </p>
                    </Reveal>
                </div>
            </section>

            <section className="pb-24 md:pb-32">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
                        {/* Form */}
                        <div className="lg:col-span-3">
                            <Reveal>
                                <ContactForm />
                            </Reveal>
                        </div>

                        {/* Contact Info */}
                        <div className="lg:col-span-2">
                            <Reveal delay={0.2}>
                                <div className="space-y-6">
                                    {contactInfo.map((info) => (
                                        <div key={info.label} className="flex items-start gap-4 p-6 rounded-xl border border-border bg-card">
                                            <info.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-muted uppercase tracking-widest mb-1">{info.label}</p>
                                                {info.href ? (
                                                    <a href={info.href} className="hoverable text-sm font-medium hover:text-primary transition-colors">
                                                        {info.value}
                                                    </a>
                                                ) : (
                                                    <p className="text-sm font-medium">{info.value}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Map Link */}
                                    <a
                                        href="https://maps.google.com/?q=Gebze,Kocaeli"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hoverable block aspect-video rounded-xl bg-card border border-border overflow-hidden group"
                                    >
                                        <div className="w-full h-full bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-500">
                                            <div className="text-center">
                                                <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                                                <span className="text-sm text-muted">Google Maps&apos;te Aç</span>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
