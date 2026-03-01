import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Webhook verification (GET)
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
        console.log("✓ Webhook verified");
        return new NextResponse(challenge, { status: 200 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Incoming messages (POST)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // WhatsApp messages
        if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
            const change = body.entry[0].changes[0].value;
            const messages = change.messages || [];
            const contacts = change.contacts || [];

            for (const msg of messages) {
                const contact = contacts.find((c: { wa_id: string }) => c.wa_id === msg.from) || {};
                const contactName = contact.profile?.name || msg.from;

                // Upsert conversation
                const { data: conv } = await supabase
                    .from("meta_conversations")
                    .upsert({
                        platform: "whatsapp",
                        contact_id: msg.from,
                        contact_name: contactName,
                        last_message: msg.text?.body || msg.type || "",
                        last_message_at: new Date().toISOString(),
                        status: "active",
                    }, { onConflict: "platform,contact_id" })
                    .select()
                    .single();

                if (conv) {
                    // Insert message
                    await supabase.from("meta_messages").insert({
                        conversation_id: conv.id,
                        platform_message_id: msg.id,
                        direction: "inbound",
                        content: msg.text?.body || "",
                        media_url: msg.image?.id || msg.video?.id || msg.document?.id || null,
                        media_type: msg.type !== "text" ? msg.type : null,
                        status: "delivered",
                    });

                    // Update unread count
                    await supabase
                        .from("meta_conversations")
                        .update({ unread_count: (conv.unread_count || 0) + 1 })
                        .eq("id", conv.id);
                }
            }
        }

        // Messenger messages
        if (body.entry?.[0]?.messaging) {
            for (const event of body.entry[0].messaging) {
                if (!event.message) continue;
                const senderId = event.sender?.id;
                if (!senderId) continue;

                // Get sender name from Graph API
                let senderName = senderId;
                try {
                    if (process.env.META_PAGE_ACCESS_TOKEN) {
                        const res = await fetch(`https://graph.facebook.com/v19.0/${senderId}?fields=name,profile_pic&access_token=${process.env.META_PAGE_ACCESS_TOKEN}`);
                        const profile = await res.json();
                        if (profile.name) senderName = profile.name;
                    }
                } catch { /* ignore */ }

                const { data: conv } = await supabase
                    .from("meta_conversations")
                    .upsert({
                        platform: "messenger",
                        contact_id: senderId,
                        contact_name: senderName,
                        last_message: event.message.text || event.message.attachments?.[0]?.type || "",
                        last_message_at: new Date().toISOString(),
                        status: "active",
                    }, { onConflict: "platform,contact_id" })
                    .select()
                    .single();

                if (conv) {
                    await supabase.from("meta_messages").insert({
                        conversation_id: conv.id,
                        platform_message_id: event.message.mid,
                        direction: "inbound",
                        content: event.message.text || "",
                        media_url: event.message.attachments?.[0]?.payload?.url || null,
                        media_type: event.message.attachments?.[0]?.type || null,
                        status: "delivered",
                    });

                    await supabase
                        .from("meta_conversations")
                        .update({ unread_count: (conv.unread_count || 0) + 1 })
                        .eq("id", conv.id);
                }
            }
        }

        // Instagram messages (same structure as Messenger)
        if (body.entry?.[0]?.messaging && body.object === "instagram") {
            for (const event of body.entry[0].messaging) {
                if (!event.message) continue;
                const senderId = event.sender?.id;
                if (!senderId) continue;

                let senderName = senderId;
                try {
                    if (process.env.META_PAGE_ACCESS_TOKEN) {
                        const res = await fetch(`https://graph.facebook.com/v19.0/${senderId}?fields=name,username,profile_pic&access_token=${process.env.META_PAGE_ACCESS_TOKEN}`);
                        const profile = await res.json();
                        senderName = profile.username || profile.name || senderId;
                    }
                } catch { /* ignore */ }

                const { data: conv } = await supabase
                    .from("meta_conversations")
                    .upsert({
                        platform: "instagram",
                        contact_id: senderId,
                        contact_name: senderName,
                        last_message: event.message.text || "Medya",
                        last_message_at: new Date().toISOString(),
                        status: "active",
                    }, { onConflict: "platform,contact_id" })
                    .select()
                    .single();

                if (conv) {
                    await supabase.from("meta_messages").insert({
                        conversation_id: conv.id,
                        platform_message_id: event.message.mid,
                        direction: "inbound",
                        content: event.message.text || "",
                        media_url: event.message.attachments?.[0]?.payload?.url || null,
                        media_type: event.message.attachments?.[0]?.type || null,
                        status: "delivered",
                    });

                    await supabase
                        .from("meta_conversations")
                        .update({ unread_count: (conv.unread_count || 0) + 1 })
                        .eq("id", conv.id);
                }
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (err: unknown) {
        console.error("Webhook error:", err);
        return NextResponse.json({ status: "ok" }); // Always return 200 to Meta
    }
}
