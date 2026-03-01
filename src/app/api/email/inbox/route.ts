import { NextResponse } from "next/server";
import { getImapClient } from "@/lib/imap";
// @ts-expect-error - mailparser has no types
import { simpleParser } from "mailparser";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "INBOX";
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "30");

    let client;
    try {
        client = await getImapClient();
        const lock = await client.getMailboxLock(folder);

        try {
            const mb = client.mailbox;
            const totalMessages = (mb && typeof mb === "object" && "exists" in mb) ? mb.exists : 0;
            const start = Math.max(1, totalMessages - page * limit + 1);
            const end = Math.max(1, totalMessages - (page - 1) * limit);

            if (totalMessages === 0) {
                return NextResponse.json({ emails: [], total: 0 });
            }

            const emails: Record<string, unknown>[] = [];

            for await (const msg of client.fetch(`${start}:${end}`, {
                envelope: true,
                flags: true,
                bodyStructure: true,
                uid: true,
                size: true,
            })) {
                const from = msg.envelope?.from?.[0];
                emails.push({
                    uid: msg.uid,
                    seq: msg.seq,
                    from: {
                        name: from?.name || "",
                        address: from?.address || "",
                    },
                    to: (msg.envelope?.to || []).map((t: { name?: string; address?: string }) => ({
                        name: t.name || "",
                        address: t.address || "",
                    })),
                    subject: msg.envelope?.subject || "(Konu yok)",
                    date: msg.envelope?.date?.toISOString() || "",
                    flags: Array.from(msg.flags || []),
                    seen: msg.flags?.has("\\Seen") || false,
                    flagged: msg.flags?.has("\\Flagged") || false,
                    size: msg.size || 0,
                    hasAttachments: false,
                });
            }

            emails.reverse();

            return NextResponse.json({ emails, total: totalMessages });
        } finally {
            lock.release();
        }
    } catch (error) {
        console.error("IMAP list error:", error);
        return NextResponse.json({ error: "E-postalar yüklenemedi.", details: String(error) }, { status: 500 });
    } finally {
        if (client) {
            try { await client.logout(); } catch { /* ignore */ }
        }
    }
}
