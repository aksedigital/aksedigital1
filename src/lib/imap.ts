import { ImapFlow } from "imapflow";

export async function getImapClient() {
    const client = new ImapFlow({
        host: "imap.gmail.com",
        port: 993,
        secure: true,
        auth: {
            user: process.env.SMTP_USER || "info@aksedigital.com",
            pass: process.env.SMTP_PASS || "",
        },
        logger: false,
    });
    await client.connect();
    return client;
}
