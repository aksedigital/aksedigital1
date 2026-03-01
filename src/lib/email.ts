import { Resend } from "resend";
import nodemailer from "nodemailer";

/* ── Resend (Primary) ── */
const resendKey = process.env.RESEND_API_KEY;
const resend = resendKey ? new Resend(resendKey) : null;

/* ── Nodemailer Fallback ── */
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const transporter = smtpUser && smtpPass
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false },
    })
    : null;

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || "info@aksedigital.com";

    // Try Resend first
    if (resend) {
        try {
            console.log("📧 [Resend] Sending to:", to);
            const { data, error } = await resend.emails.send({
                from: `Akse Digital <${from.includes("@") ? from : "info@aksedigital.com"}>`,
                to: [to],
                subject,
                html,
                text: text || undefined,
            });
            if (error) {
                console.error("❌ [Resend] Error:", error);
                // Fall through to SMTP
            } else {
                console.log("✅ [Resend] Sent:", data?.id);
                return { success: true, messageId: data?.id };
            }
        } catch (err: unknown) {
            console.error("❌ [Resend] Exception:", (err as Error).message);
            // Fall through to SMTP
        }
    }

    // SMTP fallback
    if (transporter) {
        try {
            console.log("📧 [SMTP] Sending to:", to);
            const info = await transporter.sendMail({ from, to, subject, html, text: text || "" });
            console.log("✅ [SMTP] Sent:", info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (err: unknown) {
            console.error("❌ [SMTP] Error:", (err as Error).message);
            return { success: false, error: (err as Error).message };
        }
    }

    console.error("❌ No email provider configured (RESEND_API_KEY or SMTP_USER/SMTP_PASS)");
    return { success: false, error: "E-posta servisi yapılandırılmamış." };
}
