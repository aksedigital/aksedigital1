"use client";

interface MarqueeProps {
    items: string[];
    separator?: string;
}

export function Marquee({ items, separator = "•" }: MarqueeProps) {
    const content = items.join(` ${separator} `) + ` ${separator} `;

    return (
        <div className="overflow-hidden border-y border-border py-5 select-none">
            <div className="marquee-track">
                <span className="text-2xl md:text-4xl font-extrabold tracking-tight whitespace-nowrap text-foreground/10 uppercase">
                    {content}
                </span>
                <span className="text-2xl md:text-4xl font-extrabold tracking-tight whitespace-nowrap text-foreground/10 uppercase">
                    {content}
                </span>
            </div>
        </div>
    );
}
