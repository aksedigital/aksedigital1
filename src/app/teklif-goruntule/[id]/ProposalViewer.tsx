"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Check, X, Printer } from "lucide-react";

interface LineItem {
    name: string;
    description: string;
    qty: number;
    price: number;
    tax: number;
}

interface Proposal {
    id: string;
    proposal_no: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_company: string;
    subject: string;
    items: LineItem[];
    subtotal: number;
    discount_type: string;
    discount_value: number;
    tax_total: number;
    total: number;
    currency: string;
    notes: string;
    valid_until: string;
    status: string;
    created_at: string;
}

const currencySymbol: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€" };

export default function ProposalViewer({ proposal }: { proposal: Proposal }) {
    const [status, setStatus] = useState(proposal.status);
    const [responded, setResponded] = useState(false);
    const supabase = createClient();

    const sym = currencySymbol[proposal.currency] || proposal.currency;
    const formatMoney = (v: number) => `${Number(v || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${sym}`;
    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : "";

    const subtotal = (proposal.items || []).reduce((sum: number, item: LineItem) => sum + item.qty * item.price, 0);
    const discountAmount = proposal.discount_type === "percent" ? subtotal * ((proposal.discount_value || 0) / 100) : (proposal.discount_value || 0);
    const afterDiscount = subtotal - discountAmount;
    const taxTotal = (proposal.items || []).reduce((sum: number, item: LineItem) => sum + item.qty * item.price * ((item.tax || 0) / 100), 0);
    const adjustedTax = taxTotal * (afterDiscount / (subtotal || 1));

    const handleRespond = async (newStatus: "accepted" | "rejected") => {
        await supabase.from("proposals").update({ status: newStatus }).eq("id", proposal.id);
        setStatus(newStatus);
        setResponded(true);

        // Notify admin via email
        try {
            await fetch("/api/email/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "notification",
                    to: "info@aksedigital.com",
                    title: newStatus === "accepted"
                        ? `✅ Teklif Kabul Edildi: ${proposal.proposal_no}`
                        : `❌ Teklif Reddedildi: ${proposal.proposal_no}`,
                    message: `Müşteri: ${proposal.customer_name}\nKonu: ${proposal.subject || "—"}\nToplam: ${formatMoney(proposal.total)}\n\nTeklif ${newStatus === "accepted" ? "kabul edildi" : "reddedildi"}.`,
                    link: `${window.location.origin}/admin/teklifler-gonder`,
                    buttonText: "Teklifleri Gör",
                }),
            });
        } catch {
            // Non-critical
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 print:bg-white">
            {/* Top Bar — hidden in print */}
            <div className="print:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">
                        AKSE<span className="text-[#2563EB]">.</span> <span className="text-xs font-normal text-gray-400 ml-1">Teklif</span>
                    </span>
                    <button onClick={() => window.print()} className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100">
                        <Printer className="w-3.5 h-3.5" />
                        PDF Kaydet
                    </button>
                </div>
            </div>

            {/* A4 Document */}
            <div className="max-w-3xl mx-auto my-8 print:my-0 bg-white rounded-xl print:rounded-none shadow-sm print:shadow-none p-10 sm:p-14 print:p-12">
                {/* Header */}
                <div className="flex items-start justify-between mb-12">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900">AKSE<span className="text-[#2563EB]">.</span></h1>
                        <p className="text-xs text-gray-400 mt-1">Digital Agency</p>
                        <p className="text-xs text-gray-400">aksedigital.com</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-mono text-gray-500">{proposal.proposal_no}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(proposal.created_at)}</p>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-x-10 gap-y-5 mb-10 text-sm">
                    <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Konu</p>
                        <p className="font-medium text-gray-900">{proposal.subject || "—"}</p>
                    </div>
                    <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Son Geçerlilik</p>
                        <p className="font-medium text-gray-900">{proposal.valid_until ? formatDate(proposal.valid_until) : "—"}</p>
                    </div>
                    <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Hazırlanan</p>
                        <p className="font-medium text-gray-900">{proposal.customer_name}</p>
                        {proposal.customer_company && <p className="text-xs text-gray-500">{proposal.customer_company}</p>}
                        {proposal.customer_email && <p className="text-xs text-gray-400">{proposal.customer_email}</p>}
                    </div>
                    <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Para Birimi</p>
                        <p className="font-medium text-gray-900">{proposal.currency}</p>
                    </div>
                </div>

                {/* Table */}
                <table className="w-full text-sm mb-8">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-2.5 text-[11px] text-gray-400 uppercase tracking-wide font-medium">Hizmet</th>
                            <th className="text-center py-2.5 text-[11px] text-gray-400 uppercase tracking-wide font-medium w-16">Adet</th>
                            <th className="text-right py-2.5 text-[11px] text-gray-400 uppercase tracking-wide font-medium">Birim Fiyat</th>
                            <th className="text-right py-2.5 text-[11px] text-gray-400 uppercase tracking-wide font-medium">Toplam</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(proposal.items || []).map((item: LineItem, i: number) => (
                            <tr key={i} className="border-b border-gray-100">
                                <td className="py-3">
                                    <p className="font-medium text-gray-900">{item.name}</p>
                                    {item.description && <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>}
                                </td>
                                <td className="text-center py-3 text-gray-600">{item.qty}</td>
                                <td className="text-right py-3 text-gray-600">{formatMoney(item.price)}</td>
                                <td className="text-right py-3 font-medium text-gray-900">{formatMoney(item.qty * item.price)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Summary */}
                <div className="flex justify-end mb-10">
                    <div className="w-60 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>Ara Toplam</span>
                            <span>{formatMoney(subtotal)}</span>
                        </div>
                        {(proposal.discount_value || 0) > 0 && (
                            <div className="flex justify-between text-red-500">
                                <span>İndirim {proposal.discount_type === "percent" ? `%${proposal.discount_value}` : ""}</span>
                                <span>-{formatMoney(discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-gray-500">
                            <span>KDV</span>
                            <span>{formatMoney(adjustedTax)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-2.5 text-base font-bold text-gray-900">
                            <span>Genel Toplam</span>
                            <span>{formatMoney(proposal.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {proposal.notes && (
                    <div className="border-t border-gray-100 pt-6 mb-10">
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1.5">Notlar</p>
                        <p className="text-sm text-gray-500 whitespace-pre-line">{proposal.notes}</p>
                    </div>
                )}

                {/* Accept/Reject — hidden in print */}
                {(status === "sent" || status === "viewed") && !responded && (
                    <div className="print:hidden border-t border-gray-100 pt-8">
                        <p className="text-center text-sm text-gray-500 mb-4">Bu teklifi kabul ediyor musunuz?</p>
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => handleRespond("accepted")}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors"
                            >
                                <Check className="w-4 h-4" />
                                Kabul Et
                            </button>
                            <button
                                onClick={() => handleRespond("rejected")}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 font-bold text-sm transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Reddet
                            </button>
                        </div>
                    </div>
                )}

                {/* Status message */}
                {(status === "accepted" || status === "rejected" || responded) && (
                    <div className={`print:hidden text-center py-6 rounded-xl ${status === "accepted" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        <p className="text-sm font-bold">
                            {status === "accepted" ? "✅ Teklif kabul edildi. Teşekkür ederiz!" : "❌ Teklif reddedildi."}
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">Akse Digital — aksedigital.com</p>
                </div>
            </div>
        </div>
    );
}
