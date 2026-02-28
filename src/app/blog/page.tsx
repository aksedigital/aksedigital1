import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
    title: "Blog | Dijital Pazarlama & Web Tasarım Yazıları",
    description:
        "SEO, web tasarım, sosyal medya ve dijital pazarlama hakkında güncel blog yazıları. Dijital dünyaya dair bilmeniz gereken her şey.",
};

const posts = [
    {
        title: "2026'da SEO Trendleri: Neler Değişiyor?",
        excerpt: "Yapay zeka, sesli arama ve Core Web Vitals'ın SEO üzerindeki etkisini keşfedin.",
        category: "SEO",
        date: "25 Şubat 2026",
        color: "from-blue-500/20 to-blue-600/5",
    },
    {
        title: "Etkili Landing Page Tasarımının 10 Kuralı",
        excerpt: "Dönüşüm oranınızı artıracak landing page tasarım prensiplerini öğrenin.",
        category: "Web Tasarım",
        date: "20 Şubat 2026",
        color: "from-purple-500/20 to-purple-600/5",
    },
    {
        title: "Mobil Uygulama mı, Responsive Site mi?",
        excerpt: "İşletmeniz için doğru tercih hangisi? Artı ve eksilerini karşılaştırıyoruz.",
        category: "Mobil",
        date: "15 Şubat 2026",
        color: "from-emerald-500/20 to-emerald-600/5",
    },
    {
        title: "Sosyal Medyada İçerik Stratejisi Nasıl Oluşturulur?",
        excerpt: "Etkileşim yaratan, marka bilinirliğini artıran içerik stratejisi rehberi.",
        category: "Sosyal Medya",
        date: "10 Şubat 2026",
        color: "from-orange-500/20 to-orange-600/5",
    },
    {
        title: "E-Ticaret Sitenizin Satışlarını Artırmanın 7 Yolu",
        excerpt: "Dönüşüm optimizasyonu, UX ve pazarlama taktikleri ile satışlarınızı katlamak.",
        category: "E-Ticaret",
        date: "5 Şubat 2026",
        color: "from-pink-500/20 to-pink-600/5",
    },
    {
        title: "Google Ads ile Etkili Reklam Kampanyası Oluşturma",
        excerpt: "Bütçe yönetimi, hedefleme ve reklam metni yazma hakkında ipuçları.",
        category: "Dijital Pazarlama",
        date: "1 Şubat 2026",
        color: "from-yellow-500/20 to-yellow-600/5",
    },
];

export default function BlogPage() {
    return (
        <>
            <section className="pt-32 pb-20 md:pt-40 md:pb-32">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <Reveal>
                        <p className="text-muted text-sm font-medium uppercase tracking-widest mb-4">Blog</p>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[0.95]">
                            Dijital <span className="text-primary">Dünyadan</span>
                        </h1>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <p className="text-muted text-lg md:text-xl max-w-2xl mt-8 leading-relaxed">
                            SEO, web tasarım, dijital pazarlama ve daha fazlası hakkında
                            bilgilendirici yazılar.
                        </p>
                    </Reveal>
                </div>
            </section>

            <section className="pb-24 md:pb-32">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post, i) => (
                            <Reveal key={post.title} delay={i * 0.08}>
                                <article className="hoverable group block">
                                    <div
                                        className={`aspect-[16/10] rounded-xl bg-gradient-to-br ${post.color} border border-border mb-5 overflow-hidden`}
                                    >
                                        <div className="w-full h-full group-hover:scale-105 transition-transform duration-700" />
                                    </div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-xs text-primary font-medium uppercase tracking-widest">
                                            {post.category}
                                        </span>
                                        <span className="text-xs text-muted">•</span>
                                        <span className="text-xs text-muted">{post.date}</span>
                                    </div>
                                    <h2 className="text-lg font-bold group-hover:text-primary transition-colors duration-300 mb-2">
                                        {post.title}
                                    </h2>
                                    <p className="text-sm text-muted leading-relaxed">{post.excerpt}</p>
                                </article>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
