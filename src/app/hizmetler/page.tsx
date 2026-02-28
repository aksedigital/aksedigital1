import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import {
    Globe,
    Smartphone,
    Search,
    Share2,
    ShoppingCart,
    Palette,
    TrendingUp,
    Award,
    ArrowUpRight,
    ChevronDown,
} from "lucide-react";
import { ServiceAccordion } from "./ServiceAccordion";

export const metadata: Metadata = {
    title: "Hizmetlerimiz | Web Tasarım, Mobil Uygulama, SEO",
    description:
        "Gebze ve Kocaeli'de web tasarım, mobil uygulama geliştirme, SEO, sosyal medya yönetimi, e-ticaret ve dijital pazarlama hizmetleri.",
};

const services = [
    {
        icon: Globe,
        title: "Web Tasarım & Geliştirme",
        desc: "Modern, hızlı ve SEO uyumlu web siteleri tasarlıyor ve geliştiriyoruz. Responsive tasarım, performans optimizasyonu ve kullanıcı deneyimi odaklı çalışıyoruz.",
        features: ["Kurumsal Web Sitesi", "Landing Page", "Portal & Dashboard", "WordPress / Headless CMS"],
    },
    {
        icon: Smartphone,
        title: "Mobil Uygulama",
        desc: "iOS ve Android platformları için native ve cross-platform mobil uygulamalar geliştiriyoruz.",
        features: ["iOS & Android", "React Native / Flutter", "UI/UX Tasarım", "App Store Yayınlama"],
    },
    {
        icon: Search,
        title: "SEO Hizmetleri",
        desc: "Google'da üst sıralara çıkmanız için kapsamlı SEO çalışmaları yapıyoruz.",
        features: ["Teknik SEO", "İçerik Optimizasyonu", "Yerel SEO (Gebze/Kocaeli)", "Backlink Stratejisi"],
    },
    {
        icon: Share2,
        title: "Sosyal Medya Yönetimi",
        desc: "Markanızı sosyal medyada büyütüyor, etkileşiminizi artırıyoruz.",
        features: ["İçerik Üretimi", "Topluluk Yönetimi", "Reklam Yönetimi", "Analitik & Raporlama"],
    },
    {
        icon: ShoppingCart,
        title: "E-Ticaret Çözümleri",
        desc: "Satışlarınızı artıracak profesyonel e-ticaret platformları kuruyoruz.",
        features: ["Shopify / WooCommerce", "Ödeme Entegrasyonu", "Stok Yönetimi", "Kargo Entegrasyonu"],
    },
    {
        icon: Palette,
        title: "Grafik Tasarım",
        desc: "Markanızı görsel dünyada temsil edecek yaratıcı tasarımlar üretiyoruz.",
        features: ["Logo Tasarım", "Kurumsal Kimlik", "Sosyal Medya Görseli", "Ambalaj Tasarımı"],
    },
    {
        icon: TrendingUp,
        title: "Dijital Pazarlama",
        desc: "Google Ads, dijital reklam ve performans pazarlama ile müşterilerinize ulaşın.",
        features: ["Google Ads", "Meta Ads", "Remarketing", "Dönüşüm Optimizasyonu"],
    },
    {
        icon: Award,
        title: "Marka Danışmanlığı",
        desc: "Markanızın dijital ve fiziksel dünyada güçlü ve tutarlı olmasını sağlıyoruz.",
        features: ["Marka Stratejisi", "Pozisyonlama", "Rekabet Analizi", "Marka Rehberi"],
    },
];

const faqs = [
    { q: "Web sitesi yaptırmak ne kadar sürer?", a: "Projenin kapsamına bağlı olarak 2-6 hafta arasında tamamlanır. Basit kurumsal siteler 2-3 haftada, kapsamlı projeler 4-6 haftada teslim edilir." },
    { q: "SEO sonuçları ne zaman görülür?", a: "SEO organik bir süreçtir. İlk sonuçlar genellikle 3-6 ay içinde görülmeye başlar, kalıcı sonuçlar 6-12 ay içerisinde elde edilir." },
    { q: "Hangi teknolojileri kullanıyorsunuz?", a: "Next.js, React, React Native, Node.js, TypeScript, PostgreSQL, Supabase ve modern web teknolojilerini kullanıyoruz." },
    { q: "Bakım ve destek hizmeti veriyor musunuz?", a: "Evet, tüm projelerimizde lansman sonrası bakım ve 7/24 teknik destek hizmeti sunuyoruz." },
    { q: "Ödeme planı nasıl?", a: "Projelerde genellikle %50 başlangıç, %50 teslimat şeklinde ödeme planı uyguluyoruz. Büyük projelerde taksitli ödeme seçenekleri de mevcuttur." },
];

export default function HizmetlerPage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-20 md:pt-40 md:pb-32">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <Reveal>
                        <p className="text-muted text-sm font-medium uppercase tracking-widest mb-4">
                            Hizmetler
                        </p>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[0.95]">
                            Dijital <span className="text-primary">Hizmetlerimiz</span>
                        </h1>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <p className="text-muted text-lg md:text-xl max-w-2xl mt-8 leading-relaxed">
                            İşletmenizin dijital dönüşümü için ihtiyaç duyacağınız tüm
                            hizmetleri tek bir çatı altında sunuyoruz.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* Services Grid */}
            <section className="pb-24 md:pb-32">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {services.map((s, i) => (
                            <Reveal key={s.title} delay={i * 0.06}>
                                <div className="p-8 md:p-10 rounded-2xl border border-border bg-card group hover:border-primary/30 transition-all duration-500 h-full">
                                    <s.icon className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
                                    <h2 className="text-xl md:text-2xl font-bold mb-3">{s.title}</h2>
                                    <p className="text-muted text-sm leading-relaxed mb-6">{s.desc}</p>
                                    <ul className="grid grid-cols-2 gap-2">
                                        {s.features.map((f) => (
                                            <li key={f} className="text-xs text-muted flex items-center gap-1.5">
                                                <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 md:py-32 border-t border-border">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 text-center">
                    <Reveal>
                        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
                            Projeniz İçin <span className="text-primary">Teklif Alın</span>
                        </h2>
                        <p className="text-muted text-lg max-w-xl mx-auto mb-10">
                            Hangi hizmete ihtiyaç duyarsanız duyun, size özel çözüm üretiyoruz.
                        </p>
                        <Link href="/teklif" className="hoverable magnetic-btn text-white text-lg">
                            Ücretsiz Teklif Al
                            <ArrowUpRight className="w-5 h-5" />
                        </Link>
                    </Reveal>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 md:py-32 border-t border-border">
                <div className="max-w-[800px] mx-auto px-6 md:px-10">
                    <Reveal>
                        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-16 text-center">
                            Sık Sorulan <span className="text-primary">Sorular</span>
                        </h2>
                    </Reveal>
                    <ServiceAccordion faqs={faqs} />
                </div>
            </section>
        </>
    );
}
