import { createServerSupabase } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProposalViewer from "./ProposalViewer";

export const revalidate = 0; // Always fresh

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data } = await supabase.from("proposals").select("proposal_no, subject, customer_name").eq("id", id).single();
    if (!data) return { title: "Teklif Bulunamadı" };
    return {
        title: `Teklif ${data.proposal_no} — ${data.subject || "Akse Digital"}`,
        description: `${data.customer_name} için hazırlanan teklif — Akse Digital`,
    };
}

export default async function ProposalViewPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: proposal } = await supabase.from("proposals").select("*").eq("id", id).single();

    if (!proposal) notFound();

    // Mark as viewed
    if (!proposal.viewed_at) {
        await supabase.from("proposals").update({ viewed_at: new Date().toISOString(), status: proposal.status === "sent" ? "viewed" : proposal.status }).eq("id", id);
    }

    return <ProposalViewer proposal={proposal} />;
}
