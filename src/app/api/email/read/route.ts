import { NextResponse } from "next/server";
import { getImapClient } from "@/lib/imap";
// @ts-expect-error - mailparser has no types
import { simpleParser } from "mailparser";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");
    const folder = searchParams.get("folder") || "INBOX";

    if (!uid) {
        return NextResponse.json({ error: "UID gerekli." }, { status: 400 });
    }

    let client;
    try {
        client = await getImapClient();
        const lock = await client.getMailboxLock(folder);

        try {
            const message = await client.fetchOne(uid, { source: true, flags: true, envelope: true, uid: true }, { uid: true });

            if (!message) {
                return NextResponse.json({ error: "E-posta bulunamadı." }, { status: 404 });
            }

            // Mark as seen
            await client.messageFlagsAdd(uid, ["\\Seen"], { uid: true });

            const parsed = await simpleParser(message.source);

            const attachments = (parsed.attachments || []).map((att: { filename?: string; contentType?: string; size?: number; content?: Buffer }) => ({
                filename: att.filename || "attachment",
                contentType: att.contentType || "application/octet-stream",
                size: att.size || 0,
                contentBase64: att.content ? att.content.toString("base64") : "",
            }));

            return NextResponse.json({
                uid: message.uid,
                from: {
                    name: parsed.from?.value?.[0]?.name || "",
                    address: parsed.from?.value?.[0]?.address || "",
                },
                to: (parsed.to?.value || []).map((t: { name?: string; address?: string }) => ({
                    name: t.name || "",
                    address: t.address || "",
                })),
                cc: (parsed.cc?.value || []).map((t: { name?: string; address?: string }) => ({
                    name: t.name || "",
                    address: t.address || "",
                })),
                subject: parsed.subject || "(Konu yok)",
                date: parsed.date?.toISOString() || "",
                html: parsed.html || "",
                text: parsed.text || "",
                flags: Array.from(message.flags || []),
                attachments,
            });
        } finally {
            lock.release();
        }
    } catch (error) {
        console.error("IMAP read error:", error);
        return NextResponse.json({ error: "E-posta okunamadı.", details: String(error) }, { status: 500 });
    } finally {
        if (client) {
            try { await client.logout(); } catch { /* ignore */ }
        }
    }
}
