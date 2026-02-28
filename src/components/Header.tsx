"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";

const navLinks = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/hakkimizda", label: "Hakkımızda" },
    { href: "/hizmetler", label: "Hizmetler" },
    { href: "/blog", label: "Blog" },
    { href: "/iletisim", label: "İletişim" },
];

export function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
                        ? "bg-[#050505]/80 backdrop-blur-xl border-b border-white/5"
                        : "bg-transparent"
                    }`}
            >
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="hoverable relative z-10">
                        <span className="text-xl font-extrabold tracking-tight">
                            AKSE
                            <span className="text-primary">.</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="hoverable text-sm font-medium text-muted hover:text-foreground transition-colors duration-300 relative group"
                            >
                                {link.label}
                                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full" />
                            </Link>
                        ))}
                    </nav>

                    {/* CTA */}
                    <Link
                        href="/teklif"
                        className="hoverable hidden md:inline-flex items-center gap-2 magnetic-btn text-sm text-white"
                    >
                        Teklif Al
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="hoverable md:hidden relative z-[110] w-10 h-10 flex items-center justify-center"
                        aria-label="Menü"
                    >
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </header>

            {/* Mobile Fullscreen Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ clipPath: "circle(0% at calc(100% - 40px) 40px)" }}
                        animate={{ clipPath: "circle(150% at calc(100% - 40px) 40px)" }}
                        exit={{ clipPath: "circle(0% at calc(100% - 40px) 40px)" }}
                        transition={{ duration: 0.6, ease: [0.77, 0, 0.175, 1] }}
                        className="fixed inset-0 z-[105] bg-[#050505] flex flex-col items-center justify-center"
                    >
                        <nav className="flex flex-col items-center gap-8">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className="hoverable text-4xl font-extrabold tracking-tight hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                            >
                                <Link
                                    href="/teklif"
                                    onClick={() => setMobileOpen(false)}
                                    className="magnetic-btn text-white mt-4"
                                >
                                    Teklif Al
                                    <ArrowUpRight className="w-5 h-5" />
                                </Link>
                            </motion.div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
