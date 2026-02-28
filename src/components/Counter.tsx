"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface CounterProps {
    end: number;
    suffix?: string;
    label: string;
    duration?: number;
}

export function Counter({ end, suffix = "+", label, duration = 2000 }: CounterProps) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    useEffect(() => {
        if (!isInView) return;

        let startTime: number | null = null;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
            setCount(Math.floor(eased * end));
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    }, [isInView, end, duration]);

    return (
        <div ref={ref} className="text-center">
            <div className="text-5xl md:text-7xl font-extrabold tracking-tight">
                {count}
                <span className="text-primary">{suffix}</span>
            </div>
            <p className="text-muted text-sm mt-2 uppercase tracking-widest">{label}</p>
        </div>
    );
}
