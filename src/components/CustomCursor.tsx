"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        const onMouseMove = (e: MouseEvent) => {
            cursor.style.left = e.clientX + "px";
            cursor.style.top = e.clientY + "px";
        };

        const onMouseEnter = () => cursor.classList.add("hovering");
        const onMouseLeave = () => cursor.classList.remove("hovering");

        document.addEventListener("mousemove", onMouseMove);

        const addHoverListeners = () => {
            const interactives = document.querySelectorAll(
                'a, button, [role="button"], input, textarea, select, .hoverable'
            );
            interactives.forEach((el) => {
                el.addEventListener("mouseenter", onMouseEnter);
                el.addEventListener("mouseleave", onMouseLeave);
            });
        };

        addHoverListeners();
        const observer = new MutationObserver(addHoverListeners);
        observer.observe(document.body, { childList: true, subtree: true });

        // Hide on mobile
        const mq = window.matchMedia("(pointer: coarse)");
        if (mq.matches) cursor.style.display = "none";

        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            observer.disconnect();
        };
    }, []);

    return <div ref={cursorRef} className="custom-cursor" />;
}
