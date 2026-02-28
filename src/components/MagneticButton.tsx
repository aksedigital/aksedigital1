"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";

interface MagneticButtonProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export function MagneticButton({ children, className = "", onClick }: MagneticButtonProps) {
    const btnRef = useRef<HTMLButtonElement>(null);

    const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
        const btn = btnRef.current;
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    };

    const handleMouseLeave = () => {
        const btn = btnRef.current;
        if (btn) btn.style.transform = "translate(0, 0)";
    };

    return (
        <button
            ref={btnRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className={`magnetic-btn hoverable ${className}`}
        >
            {children}
        </button>
    );
}
