import Link from "next/link";
import { ArrowUpRight, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-border bg-[#050505]">
            {/* Big CTA Section */}
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-20 md:py-32">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
                    <div>
                        <p className="text-muted text-sm font-medium mb-4 uppercase tracking-widest">
                            Bir sonraki projeniz
                        </p>
                        <h2 className="text-4xl md:text-7xl lg:text-8xl font-extrabold leading-[0.95] tracking-tight">
                            Birlikte
                            <br />
                            <span className="text-primary">çalışalım.</span>
                        </h2>
                    </div>
                    <Link
                        href="/teklif"
                        className="hoverable magnetic-btn text-white text-lg"
                    >
                        Teklif Al
                        <ArrowUpRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="border-t border-border">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <span className="text-2xl font-extrabold tracking-tight">
                            AKSE<span className="text-primary">.</span>
                        </span>
                        <p className="text-muted text-sm mt-4 leading-relaxed">
                            Gebze merkezli dijital ajans. Markanızı dijitale taşıyoruz.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest mb-4 text-muted">
                            Sayfalar
                        </h4>
                        <ul className="space-y-3">
                            {["Hakkımızda", "Hizmetler", "Blog", "İletişim"].map((item) => (
                                <li key={item}>
                                    <Link
                                        href={`/${item.toLowerCase().replace("ı", "i").replace("ö", "o")}`}
                                        className="hoverable text-sm text-foreground/70 hover:text-primary transition-colors"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest mb-4 text-muted">
                            Hizmetler
                        </h4>
                        <ul className="space-y-3">
                            {["Web Tasarım", "Mobil Uygulama", "SEO", "Sosyal Medya", "E-Ticaret"].map(
                                (item) => (
                                    <li key={item}>
                                        <span className="text-sm text-foreground/70">{item}</span>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest mb-4 text-muted">
                            İletişim
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-sm text-foreground/70">
                                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                Gebze, Kocaeli
                            </li>
                            <li>
                                <a
                                    href="tel:+905550000000"
                                    className="hoverable flex items-center gap-2 text-sm text-foreground/70 hover:text-primary transition-colors"
                                >
                                    <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                                    +90 555 000 0000
                                </a>
                            </li>
                            <li>
                                <a
                                    href="mailto:info@aksedigital.com"
                                    className="hoverable flex items-center gap-2 text-sm text-foreground/70 hover:text-primary transition-colors"
                                >
                                    <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                                    info@aksedigital.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-border">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted">
                        © 2026 Akse Digital. Tüm hakları saklıdır.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hoverable text-xs text-muted hover:text-primary transition-colors">
                            Instagram
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hoverable text-xs text-muted hover:text-primary transition-colors">
                            LinkedIn
                        </a>
                        <a href="https://wa.me/905550000000" target="_blank" rel="noopener noreferrer" className="hoverable text-xs text-muted hover:text-primary transition-colors">
                            WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
