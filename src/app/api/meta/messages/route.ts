import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get("action") || "conversations";
        const platform = searchParams.get("platform");
        const conversationId = searchParams.get("conversation_id");

        if (action === "messages" && conversationId) {
            const { data, error } = await supabase
                .from("meta_messages")
                .select("*")
                .eq("conversation_id", conversationId)
                .order("created_at", { ascending: true })
                .limit(200);
            if (error) throw error;

            // Mark as read
            await supabase
                .from("meta_conversations")
                .update({ unread_count: 0 })
                .eq("id", conversationId);

            return NextResponse.json({ success: true, data });
        }

        // List conversations
        let q = supabase
            .from("meta_conversations")
            .select("*")
            .order("last_message_at", { ascending: false });

        if (platform && platform !== "all") {
            q = q.eq("platform", platform);
        }

        const { data, error } = await q.limit(100);
        if (error) throw error;

        // Get total unread
        const totalUnread = (data || []).reduce((s, c) => s + (c.unread_count || 0), 0);

        return NextResponse.json({ success: true, data, totalUnread });
    } catch (err: unknown) {
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action } = body;

        // Send message
        if (action === "send") {
            const { conversation_id, content } = body;

            // Get conversation to know platform and contact
            const { data: conv } = await supabase
                .from("meta_conversations")
                .select("*")
                .eq("id", conversation_id)
                .single();

            if (!conv) throw new Error("Conversation not found");

            let platformMessageId: string | null = null;
            let sendSuccess = false;

            // Send via platform API
            if (conv.platform === "whatsapp") {
                const token = process.env.META_WHATSAPP_TOKEN;
                const phoneId = process.env.META_WHATSAPP_PHONE_ID;
                if (token && phoneId) {
                    try {
                        const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                            body: JSON.stringify({
                                messaging_product: "whatsapp",
                                to: conv.contact_id,
                                type: "text",
                                text: { body: content },
                            }),
                        });
                        const data = await res.json();
                        platformMessageId = data.messages?.[0]?.id || null;
                        sendSuccess = res.ok;
                    } catch (e) { console.error("WhatsApp send error:", e); }
                }
            } else if (conv.platform === "messenger" || conv.platform === "instagram") {
                const token = process.env.META_PAGE_ACCESS_TOKEN;
                if (token) {
                    try {
                        const res = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${token}`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                recipient: { id: conv.contact_id },
                                message: { text: content },
                            }),
                        });
                        const data = await res.json();
                        platformMessageId = data.message_id || null;
                        sendSuccess = res.ok;
                    } catch (e) { console.error("Messenger/IG send error:", e); }
                }
            }

            // Save message to DB regardless
            const { data: msg, error } = await supabase.from("meta_messages").insert({
                conversation_id,
                platform_message_id: platformMessageId,
                direction: "outbound",
                content,
                status: sendSuccess ? "sent" : (process.env.META_WHATSAPP_TOKEN || process.env.META_PAGE_ACCESS_TOKEN ? "failed" : "sent"),
            }).select().single();
            if (error) throw error;

            // Update conversation
            await supabase.from("meta_conversations").update({
                last_message: content,
                last_message_at: new Date().toISOString(),
            }).eq("id", conversation_id);

            return NextResponse.json({ success: true, data: msg, platformSent: sendSuccess });
        }

        // Archive conversation
        if (action === "archive") {
            await supabase.from("meta_conversations").update({ status: "archived" }).eq("id", body.id);
            return NextResponse.json({ success: true });
        }

        // Delete conversation
        if (action === "delete") {
            await supabase.from("meta_messages").delete().eq("conversation_id", body.id);
            await supabase.from("meta_conversations").delete().eq("id", body.id);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    } catch (err: unknown) {
        console.error("Meta messages POST error:", err);
        return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
    }
}
