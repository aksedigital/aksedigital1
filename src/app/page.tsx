"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDown,
  Globe,
  Smartphone,
  Search,
  Share2,
  ShoppingCart,
  Palette,
  TrendingUp,
  Award,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Marquee } from "@/components/Marquee";
import { Counter } from "@/components/Counter";

/* ── DATA ──────────────────────────────────────── */

const services = [
  {
    num: "01",
    icon: Globe,
    title: "Web Tasarım",
    desc: "Modern, hızlı ve SEO uyumlu web siteleri tasarlıyor ve geliştiriyoruz.",
  },
  {
    num: "02",
    icon: Smartphone,
    title: "Mobil Uygulama",
    desc: "iOS ve Android için kullanıcı dostu mobil uygulamalar geliştiriyoruz.",
  },
  {
    num: "03",
    icon: Search,
    title: "SEO",
    desc: "Google'da üst sıralara çıkmanız için stratejik SEO çalışmaları yapıyoruz.",
  },
  {
    num: "04",
    icon: Share2,
    title: "Sosyal Medya",
    desc: "Markanızı sosyal medyada büyütüyor, etkileşiminizi artırıyoruz.",
  },
  {
    num: "05",
    icon: ShoppingCart,
    title: "E-Ticaret",
    desc: "Satışlarınızı artıracak profesyonel e-ticaret çözümleri sunuyoruz.",
  },
  {
    num: "06",
    icon: Palette,
    title: "Grafik Tasarım",
    desc: "Logo, kurumsal kimlik ve yaratıcı tasarım çözümleri üretiyoruz.",
  },
  {
    num: "07",
    icon: TrendingUp,
    title: "Dijital Pazarlama",
    desc: "Google Ads ve dijital reklam yönetimi ile müşterilerinize ulaşın.",
  },
  {
    num: "08",
    icon: Award,
    title: "Marka Yönetimi",
    desc: "Markanızın dijital dünyada güçlü ve tutarlı olmasını sağlıyoruz.",
  },
];

const projects = [
  {
    title: "E-Ticaret Platformu",
    category: "Web Tasarım",
    color: "from-blue-500/20 to-blue-600/5",
  },
  {
    title: "Restoran Mobil App",
    category: "Mobil Uygulama",
    color: "from-purple-500/20 to-purple-600/5",
  },
  {
    title: "Kurumsal Web Sitesi",
    category: "Web Tasarım & SEO",
    color: "from-emerald-500/20 to-emerald-600/5",
  },
  {
    title: "Sosyal Medya Kampanyası",
    category: "Dijital Pazarlama",
    color: "from-orange-500/20 to-orange-600/5",
  },
  {
    title: "SaaS Dashboard",
    category: "UI/UX Tasarım",
    color: "from-pink-500/20 to-pink-600/5",
  },
];

const blogPosts = [
  {
    title: "2026'da SEO Trendleri: Neler Değişiyor?",
    category: "SEO",
    date: "25 Şubat 2026",
  },
  {
    title: "Etkili Landing Page Tasarımının 10 Kuralı",
    category: "Web Tasarım",
    date: "20 Şubat 2026",
  },
  {
    title: "Mobil Uygulama mı, Responsive Site mi?",
    category: "Mobil",
    date: "15 Şubat 2026",
  },
];

/* ── HERO ──────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Mesh Blobs */}
      <div className="gradient-mesh gradient-mesh--blue absolute top-1/4 -left-40" />
      <div className="gradient-mesh gradient-mesh--purple absolute bottom-1/4 -right-40" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 pt-32 pb-20 w-full">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-muted text-sm md:text-base font-medium uppercase tracking-[0.3em] mb-6"
        >
          Gebze Merkezli Dijital Ajans
        </motion.p>

        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-[120px] font-extrabold leading-[0.9] tracking-tight"
          >
            DİJİTAL
          </motion.h1>
        </div>
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-[120px] font-extrabold leading-[0.9] tracking-tight"
          >
            DENEYİMLER
          </motion.h1>
        </div>
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-[120px] font-extrabold leading-[0.9] tracking-tight text-primary"
          >
            YARATIYORUZ<span className="text-foreground">.</span>
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-muted text-base md:text-lg max-w-xl mt-8 leading-relaxed"
        >
          Web tasarım, mobil uygulama geliştirme ve dijital pazarlama ile
          markanızı bir üst seviyeye taşıyoruz.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-wrap gap-4 mt-10"
        >
          <Link href="/teklif" className="hoverable magnetic-btn text-white">
            Ücretsiz Teklif Al
            <ArrowUpRight className="w-5 h-5" />
          </Link>
          <Link
            href="/hizmetler"
            className="hoverable magnetic-btn-outline text-foreground rounded-full"
          >
            Hizmetlerimiz
          </Link>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted uppercase tracking-widest">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ArrowDown className="w-4 h-4 text-muted" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── SERVICES ──────────────────────────────────── */

function Services() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <Reveal>
          <p className="text-muted text-sm font-medium uppercase tracking-widest mb-4">
            Hizmetlerimiz
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-16">
            Ne yapıyoruz<span className="text-primary">?</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {services.map((service, i) => (
            <Reveal key={service.num} delay={i * 0.06}>
              <div className="bg-background p-8 group hover:bg-card transition-colors duration-500 h-full">
                <span className="text-xs text-muted font-mono">{service.num}</span>
                <service.icon className="w-8 h-8 mt-4 mb-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{service.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── PROJECTS ──────────────────────────────────── */

function Projects() {
  return (
    <section className="py-24 md:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 mb-16">
        <Reveal>
          <p className="text-muted text-sm font-medium uppercase tracking-widest mb-4">
            Projelerimiz
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Seçilmiş <span className="text-primary">İşler</span>
          </h2>
        </Reveal>
      </div>

      <div className="flex gap-6 px-6 md:px-10 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide">
        {projects.map((project, i) => (
          <Reveal key={project.title} delay={i * 0.1}>
            <div className="hoverable min-w-[320px] md:min-w-[450px] snap-center group">
              <div
                className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${project.color} border border-border flex items-end p-8 relative overflow-hidden`}
              >
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <span className="text-xs text-muted uppercase tracking-widest">
                    {project.category}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold mt-2 group-hover:text-primary transition-colors duration-300">
                    {project.title}
                  </h3>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ── STATS ─────────────────────────────────────── */

function Stats() {
  return (
    <section className="py-24 md:py-32 border-y border-border">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
          <Counter end={150} label="Proje" />
          <Counter end={50} label="Müşteri" />
          <Counter end={8} label="Yıl Deneyim" />
          <Counter end={99} suffix="%" label="Memnuniyet" />
        </div>
      </div>
    </section>
  );
}

/* ── BLOG PREVIEW ──────────────────────────────── */

function BlogPreview() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <Reveal>
          <div className="flex items-end justify-between mb-16">
            <div>
              <p className="text-muted text-sm font-medium uppercase tracking-widest mb-4">
                Blog
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
                Son <span className="text-primary">Yazılar</span>
              </h2>
            </div>
            <Link
              href="/blog"
              className="hoverable hidden md:inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
            >
              Tümünü Gör
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.map((post, i) => (
            <Reveal key={post.title} delay={i * 0.1}>
              <Link href="/blog" className="hoverable group block">
                <div className="aspect-[16/10] rounded-xl bg-card border border-border mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 group-hover:scale-105 transition-transform duration-700" />
                </div>
                <span className="text-xs text-primary font-medium uppercase tracking-widest">
                  {post.category}
                </span>
                <h3 className="text-lg font-bold mt-2 group-hover:text-primary transition-colors duration-300">
                  {post.title}
                </h3>
                <p className="text-sm text-muted mt-2">{post.date}</p>
              </Link>
            </Reveal>
          ))}
        </div>

        <Link
          href="/blog"
          className="hoverable md:hidden inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mt-8"
        >
          Tümünü Gör
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

/* ── PAGE ──────────────────────────────────────── */

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee
        items={[
          "Web Tasarım",
          "Mobil Uygulama",
          "SEO",
          "Sosyal Medya",
          "E-Ticaret",
          "Dijital Pazarlama",
          "Grafik Tasarım",
          "Marka Yönetimi",
        ]}
      />
      <Services />
      <Projects />
      <Stats />
      <BlogPreview />
    </>
  );
}
