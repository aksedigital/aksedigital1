import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { Users, Target, Lightbulb, HeartHandshake, Zap, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
    title: "Hakkımızda | Gebze Dijital Ajans",
    description:
        "Akse Digital olarak Kocaeli Gebze'de dijital dünyanın kapılarını açıyoruz. Ekibimiz, değerlerimiz ve çalışma sürecimiz hakkında bilgi alın.",
};

const values = [
    { icon: Target, title: "Sonuç Odaklı", desc: "Her projede ölçülebilir sonuçlar hedefliyoruz." },
    { icon: Lightbulb, title: "Yenilikçi", desc: "En güncel teknolojileri ve trendleri takip ediyoruz." },
    { icon: HeartHandshake, title: "Güvenilir", desc: "Şeffaf iletişim ve zamanında teslimat sözümüz." },
    { icon: Zap, title: "Hızlı", desc: "Çevik süreçlerle projeleri hızla hayata geçiriyoruz." },
];

const process = [
    { step: "01", title: "Analiz", desc: "İhtiyaçlarınızı dinliyor, hedeflerinizi belirliyoruz." },
    { step: "02", title: "Tasarım", desc: "Markanıza özel yaratıcı tasarım çözümleri üretiyoruz." },
    { step: "03", title: "Geliştirme", desc: "Modern teknolojilerle projelerinizi kodluyoruz." },
    { step: "04", title: "Teslimat", desc: "Test, optimizasyon ve lansman sonrası destek." },
];

export default function HakkimizdaPage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-20 md:pt-40 md:pb-32">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <Reveal>
                        <p className="text-muted text-sm font-medium uppercase tracking-widest mb-4">
                            Hakkımızda
                        </p>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[0.95]">
                            Biz <span className="text-primary">Kimiz?</span>
                        </h1>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <p className="text-muted text-lg md:text-xl max-w-2xl mt-8 leading-relaxed">
                            Kocaeli Gebze merkezli bir dijital ajans olarak, işletmelerin
                            dijital dünyada güçlü bir varlık oluşturmasına yardımcı oluyoruz.
                            Web tasarım, mobil uygulama, SEO ve dijital pazarlama alanlarında
                            uzman ekibimizle müşterilerimize değer katıyoruz.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 md:py-32 border-t border-border">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <Reveal>
                        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-16">
                            Değerlerimiz<span className="text-primary">.</span>
                        </h2>
                    </Reveal>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((v, i) => (
                            <Reveal key={v.title} delay={i * 0.1}>
                                <div className="p-8 rounded-2xl border border-border bg-card group hover:border-primary/30 transition-colors duration-500">
                                    <v.icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                                    <h3 className="text-lg font-bold mb-2">{v.title}</h3>
                                    <p className="text-muted text-sm leading-relaxed">{v.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process */}
            <section className="py-24 md:py-32 border-t border-border">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <Reveal>
                        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-16">
                            Nasıl <span className="text-primary">Çalışıyoruz?</span>
                        </h2>
                    </Reveal>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {process.map((p, i) => (
                            <Reveal key={p.step} delay={i * 0.1}>
                                <div className="relative">
                                    <span className="text-6xl font-extrabold text-foreground/5">{p.step}</span>
                                    <h3 className="text-xl font-bold mt-2">{p.title}</h3>
                                    <p className="text-muted text-sm mt-2 leading-relaxed">{p.desc}</p>
                                    {i < process.length - 1 && (
                                        <div className="hidden lg:block absolute top-8 -right-4 w-8 h-px bg-border" />
                                    )}
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Akse */}
            <section className="py-24 md:py-32 border-t border-border">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <Reveal>
                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-8">
                                Neden <span className="text-primary">Akse?</span>
                            </h2>
                            <ul className="space-y-4">
                                {[
                                    "Gebze ve Kocaeli'nin yerel dinamiklerini biliyoruz",
                                    "Sonuç odaklı, ölçülebilir stratejiler uyguluyoruz",
                                    "7/24 teknik destek sunuyoruz",
                                    "Şeffaf fiyatlandırma ve raporlama sağlıyoruz",
                                    "Modern teknolojiler ve güncel trendleri takip ediyoruz",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                        <span className="text-muted text-sm leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border flex items-center justify-center">
                                <Users className="w-24 h-24 text-primary/30" />
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>
        </>
    );
}
