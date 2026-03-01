"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { GrainOverlay } from "@/components/GrainOverlay";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");
    const isLogin = pathname === "/login";
    const isPortal = pathname.startsWith("/portal");
    const isTeklifView = pathname.startsWith("/teklif-goruntule");
    const hideChrome = isAdmin || isLogin || isPortal || isTeklifView;

    if (hideChrome) {
        return <>{children}</>;
    }

    return (
        <SmoothScroll>
            <GrainOverlay />
            <Header />
            <main>{children}</main>
            <Footer />
        </SmoothScroll>
    );
}

