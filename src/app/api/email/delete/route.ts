import { NextResponse } from "next/server";
import { getImapClient } from "@/lib/imap";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    const body = await request.json();
    const { uid, folder = "INBOX" } = body;

    if (!uid) {
        return NextResponse.json({ error: "UID gerekli." }, { status: 400 });
    }

    let client;
    try {
        client = await getImapClient();
        const lock = await client.getMailboxLock(folder);

        try {
            await client.messageFlagsAdd(uid, ["\\Deleted"], { uid: true });
            await client.messageDelete(uid, { uid: true });
            return NextResponse.json({ success: true });
        } finally {
            lock.release();
        }
    } catch (error) {
        console.error("IMAP delete error:", error);
        return NextResponse.json({ error: "E-posta silinemedi." }, { status: 500 });
    } finally {
        if (client) {
            try { await client.logout(); } catch { /* ignore */ }
        }
    }
}
