import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { proposalEmailTemplate, notificationEmailTemplate } from "@/lib/email-templates";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, ...data } = body;

        if (type === "proposal") {
            const { to, customerName, subject, total, currency, validUntil, proposalNo, link } = data;

            if (!to || !link) {
                return NextResponse.json({ error: "Gerekli alanlar eksik (to, link)." }, { status: 400 });
            }

            const html = proposalEmailTemplate({
                customerName: customerName || "",
                subject: subject || "",
                total: total || "0",
                currency: currency || "TRY",
                validUntil: validUntil || "",
                proposalNo: proposalNo || "",
                link,
            });

            const result = await sendEmail({
                to,
                subject: `Teklif: ${subject || proposalNo || "Akse Digital"}`,
                html,
            });

            if (result.success) {
                return NextResponse.json({ success: true, messageId: result.messageId });
            }
            return NextResponse.json({ error: result.error || "E-posta gönderilemedi." }, { status: 500 });
        }

        if (type === "notification") {
            const { to, title, message, link, buttonText } = data;

            if (!to || !title) {
                return NextResponse.json({ error: "Gerekli alanlar eksik (to, title)." }, { status: 400 });
            }

            const html = notificationEmailTemplate({ title, message, link, buttonText });

            const result = await sendEmail({
                to,
                subject: title,
                html,
            });

            if (result.success) {
                return NextResponse.json({ success: true, messageId: result.messageId });
            }
            return NextResponse.json({ error: result.error || "E-posta gönderilemedi." }, { status: 500 });
        }

        // Direct send (for compose in email client)
        if (type === "direct") {
            const { to, subject: subj, html: rawHtml, text: rawText } = data;

            if (!to || !subj) {
                return NextResponse.json({ error: "Gerekli alanlar eksik (to, subject)." }, { status: 400 });
            }

            const result = await sendEmail({
                to,
                subject: subj,
                html: rawHtml || `<p>${(rawText || "").replace(/\n/g, "<br>")}</p>`,
                text: rawText,
            });

            if (result.success) {
                return NextResponse.json({ success: true, messageId: result.messageId });
            }
            return NextResponse.json({ error: result.error || "E-posta gönderilemedi." }, { status: 500 });
        }

        return NextResponse.json({ error: "Geçersiz tip." }, { status: 400 });
    } catch (err: unknown) {
        console.error("Email route error:", err);
        return NextResponse.json({ error: (err as Error).message || "Sunucu hatası." }, { status: 500 });
    }
}
