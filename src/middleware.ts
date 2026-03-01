import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-secret-key-change-me"
);

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("auth_token")?.value;
    const path = request.nextUrl.pathname;

    // Admin routes protection
    if (path.startsWith("/admin")) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            if (payload.role === "customer") {
                return NextResponse.redirect(new URL("/portal", request.url));
            }
        } catch {
            // Invalid token
            const res = NextResponse.redirect(new URL("/login", request.url));
            res.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
            return res;
        }
    }

    // Portal routes protection
    if (path.startsWith("/portal") && !path.startsWith("/portal/giris")) {
        if (!token) {
            return NextResponse.redirect(new URL("/portal/giris", request.url));
        }
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            if (payload.role !== "customer") {
                return NextResponse.redirect(new URL("/admin", request.url));
            }
        } catch {
            const res = NextResponse.redirect(new URL("/portal/giris", request.url));
            res.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
            return res;
        }
    }

    // Login page — redirect if already logged in
    if (path === "/login" && token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            if (payload.role === "customer") {
                return NextResponse.redirect(new URL("/portal", request.url));
            }
            return NextResponse.redirect(new URL("/admin", request.url));
        } catch { /* invalid token, stay on login */ }
    }

    // Portal login page — redirect if already logged in
    if (path === "/portal/giris" && token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            if (payload.role === "customer") {
                return NextResponse.redirect(new URL("/portal", request.url));
            }
        } catch { /* stay on login */ }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/login", "/portal/:path*"],
};
