import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { Shield, Clock, HeartHandshake } from "lucide-react";
import { QuoteForm } from "./QuoteForm";

export const metadata: Metadata = {
    title: "Ücretsiz Teklif Al | Gebze Web Tasarım",
    description:
        "Projeniz için ücretsiz teklif alın. Web tasarım, mobil uygulama, SEO ve dijital pazarlama hizmetleri için hemen formu doldurun.",
};

const badges = [
    { icon: Shield, label: "Ücretsiz Danışmanlık" },
    { icon: Clock, label: "24 Saat İçinde Dönüş" },
    { icon: HeartHandshake, label: "Gizlilik Güvencesi" },
];

export default function TeklifPage() {
    return (
        <>
            <section className="pt-32 pb-20 md:pt-40 md:pb-32">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <Reveal>
                        <p className="text-muted text-sm font-medium uppercase tracking-widest mb-4">
                            Teklif Al
                        </p>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[0.95]">
                            Projeniz İçin <span className="text-primary">Ücretsiz</span> Teklif
                        </h1>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <p className="text-muted text-lg md:text-xl max-w-2xl mt-8 leading-relaxed">
                            Formu doldurun, size özel bir teklif hazırlayalım. Danışmanlık
                            görüşmemiz tamamen ücretsizdir.
                        </p>
                    </Reveal>
                    <Reveal delay={0.3}>
                        <div className="flex flex-wrap gap-4 mt-8">
                            {badges.map((b) => (
                                <div
                                    key={b.label}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-xs text-muted"
                                >
                                    <b.icon className="w-4 h-4 text-primary" />
                                    {b.label}
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            <section className="pb-24 md:pb-32">
                <div className="max-w-[800px] mx-auto px-6 md:px-10">
                    <Reveal>
                        <QuoteForm />
                    </Reveal>
                </div>
            </section>
        </>
    );
}
