"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/Reveal";

interface FAQ {
    q: string;
    a: string;
}

export function ServiceAccordion({ faqs }: { faqs: FAQ[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="space-y-4">
            {faqs.map((faq, i) => (
                <Reveal key={faq.q} delay={i * 0.08}>
                    <div className="border border-border rounded-xl overflow-hidden">
                        <button
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            className="hoverable w-full flex items-center justify-between p-6 text-left"
                        >
                            <span className="font-bold text-sm md:text-base pr-4">{faq.q}</span>
                            <ChevronDown
                                className={`w-5 h-5 text-muted flex-shrink-0 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""
                                    }`}
                            />
                        </button>
                        <AnimatePresence>
                            {openIndex === i && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    className="overflow-hidden"
                                >
                                    <p className="px-6 pb-6 text-muted text-sm leading-relaxed">{faq.a}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Reveal>
            ))}
        </div>
    );
}
