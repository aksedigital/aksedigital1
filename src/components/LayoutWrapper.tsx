"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CustomCursor } from "@/components/CustomCursor";
import { SmoothScroll } from "@/components/SmoothScroll";
import { GrainOverlay } from "@/components/GrainOverlay";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");
    const isLogin = pathname === "/login";
    const hideChrome = isAdmin || isLogin;

    if (hideChrome) {
        return <>{children}</>;
    }

    return (
        <SmoothScroll>
            <CustomCursor />
            <GrainOverlay />
            <Header />
            <main>{children}</main>
            <Footer />
        </SmoothScroll>
    );
}
