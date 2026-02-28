"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface RevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "left" | "right";
}

export function Reveal({ children, className = "", delay = 0, direction = "up" }: RevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    const variants = {
        hidden: {
            opacity: 0,
            y: direction === "up" ? 60 : 0,
            x: direction === "left" ? -60 : direction === "right" ? 60 : 0,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
        },
    };

    return (
        <motion.div
            ref={ref}
            variants={variants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
