"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
    Plus, Trash2, Save, Send, ArrowLeft, Copy, Check, X,
    MessageSquare, Mail, Smartphone, Link2, ZoomIn, ZoomOut,
} from "lucide-react";

/* ── Types ── */
interface LineItem {
    name: string;
    description: string;
    qty: number;
    price: number;
    tax: number;
}

const currencies = [
    { code: "TRY", symbol: "₺", label: "Türk Lirası", flag: "🇹🇷" },
    { code: "USD", symbol: "$", label: "US Dollar", flag: "🇺🇸" },
    { code: "EUR", symbol: "€", label: "Euro", flag: "🇪🇺" },
];
const taxOpts = [0, 10, 20];
const blankItem: LineItem = { name: "", description: "", qty: 1, price: 0, tax: 20 };

/* ── Wrapper (Suspense for useSearchParams) ── */
export default function Page() {
    return (
        <Suspense fallback={<p className="p-8 text-center text-muted text-sm">Yükleniyor…</p>}>
            <Builder />
        </Suspense>
    );
}

/* ── Main Component ── */
function Builder() {
    const router = useRouter();
    const sp = useSearchParams();
    const editId = sp.get("edit");
    const supabase = createClient();

    /* state */
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [company, setCompany] = useState("");
    const [subject, setSubject] = useState("");
    const [validUntil, setValidUntil] = useState("");
    const [currency, setCurrency] = useState("TRY");
    const [items, setItems] = useState<LineItem[]>([{ ...blankItem }]);
    const [discType, setDiscType] = useState("percent");
    const [discVal, setDiscVal] = useState(0);
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [showSend, setShowSend] = useState(false);
    const [savedId, setSavedId] = useState<string | null>(editId);
    const [pNo, setPNo] = useState("");
    const [zoom, setZoom] = useState(0.72);
    const [copied, setCopied] = useState(false);
    const [msg, setMsg] = useState("");

    /* load edit */
    useEffect(() => {
        if (editId) {
            supabase.from("proposals").select("*").eq("id", editId).single().then(({ data: d }) => {
                if (!d) return;
                setName(d.customer_name || ""); setEmail(d.customer_email || "");
                setPhone(d.customer_phone || ""); setCompany(d.customer_company || "");
                setSubject(d.subject || ""); setValidUntil(d.valid_until || "");
                setCurrency(d.currency || "TRY"); setNotes(d.notes || "");
                setItems(d.items?.length ? d.items : [{ ...blankItem }]);
                setDiscType(d.discount_type || "percent"); setDiscVal(d.discount_value || 0);
                setPNo(d.proposal_no || "");
            });
        } else {
            const n = new Date();
            setPNo(`AKSE-${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}${String(n.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editId]);

    /* calculations */
    const cur = currencies.find(c => c.code === currency) || currencies[0];
    const sub = items.reduce((s, i) => s + i.qty * i.price, 0);
    const discAmt = discType === "percent" ? sub * (discVal / 100) : discVal;
    const afterDisc = sub - discAmt;
    const taxTot = items.reduce((s, i) => s + i.qty * i.price * (i.tax / 100), 0);
    const adjTax = sub > 0 ? taxTot * (afterDisc / sub) : 0;
    const total = afterDisc + adjTax;
    const fmt = (v: number) => `${v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur.symbol}`;
    const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : "";

    const upItem = (i: number, k: keyof LineItem, v: string | number) => {
        setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
    };

    /* save */
    const save = async (send: boolean) => {
        if (!name.trim()) { alert("Müşteri adı zorunludur."); return; }
        setSaving(true);
        const payload = {
            proposal_no: pNo, customer_name: name.trim(), customer_email: email,
            customer_phone: phone, customer_company: company, subject, items,
            subtotal: sub, discount_type: discType, discount_value: discVal,
            tax_total: adjTax, total, currency, notes,
            valid_until: validUntil || null, status: send ? "sent" : "draft",
        };
        let id = savedId;
        if (savedId) {
            await supabase.from("proposals").update(payload).eq("id", savedId);
        } else {
            const { data } = await supabase.from("proposals").insert(payload).select("id").single();
            id = data?.id || null; setSavedId(id);
        }
        setSaving(false);
        if (send && id) {
            const link = `${window.location.origin}/teklif-goruntule/${id}`;
            setMsg(`Sayın ${name.trim()},\n\n${subject || "Hizmet"} için hazırladığımız teklifi inceleyebilirsiniz:\n\n${link}\n\nToplam: ${fmt(total)}\n${validUntil ? `Geçerlilik: ${fmtDate(validUntil)}\n` : ""}Akse Digital`);
            setShowSend(true);
        } else if (!send) {
            alert("✅ Taslak kaydedildi!");
        }
    };

    /* send */
    const sendVia = async (method: string) => {
        const link = `${window.location.origin}/teklif-goruntule/${savedId}`;
        const enc = encodeURIComponent(msg);
        if (method === "whatsapp") {
            window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${enc}`, "_blank");
        } else if (method === "email") {
            try {
                const r = await fetch("/api/email/send", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "proposal", to: email, customerName: name, subject, total: fmt(total), currency, validUntil: validUntil ? fmtDate(validUntil) : "", proposalNo: pNo, link })
                });
                const d = await r.json();
                alert(d.success ? "✅ E-posta gönderildi!" : `❌ ${d.error || "Gönderilemedi."}`);
            } catch { alert("❌ E-posta gönderilemedi."); }
        } else if (method === "sms") {
            window.open(`sms:${phone}?body=${enc}`);
        } else {
            navigator.clipboard.writeText(link); setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const canSave = name.trim().length > 0;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.push("/admin/teklifler-gonder")} className="text-muted hover:text-foreground transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-extrabold">{editId ? "Teklif Düzenle" : "Yeni Teklif"}</h1>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
                {/* ═══ LEFT: FORM ═══ */}
                <div className="w-full xl:w-[520px] flex-shrink-0 space-y-5">

                    {/* Customer */}
                    <div className="bg-[#111] border border-white/5 rounded-xl p-5">
                        <p className="text-xs text-muted uppercase mb-3 font-medium">Müşteri Bilgisi</p>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                                {name.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="flex-1 space-y-2">
                                <input value={name} onChange={e => setName(e.target.value)} placeholder="Ad Soyad *"
                                    className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted/40" />
                                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-posta"
                                    className="w-full bg-transparent text-xs text-muted focus:outline-none placeholder:text-muted/40" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefon"
                                className="bg-[#0a0a0a] border border-white/5 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/30" />
                            <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Şirket"
                                className="bg-[#0a0a0a] border border-white/5 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/30" />
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-xs text-muted uppercase mb-1.5">Konu</p>
                            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Web Tasarım"
                                className="w-full bg-[#111] border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                        </div>
                        <div>
                            <p className="text-xs text-muted uppercase mb-1.5">Son Tarih</p>
                            <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)}
                                className="w-full bg-[#111] border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-muted uppercase mb-1.5">Para Birimi</p>
                        <select value={currency} onChange={e => setCurrency(e.target.value)}
                            className="w-full bg-[#111] border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30">
                            {currencies.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.label}</option>)}
                        </select>
                    </div>

                    {/* Items */}
                    <div className="bg-[#111] border border-white/5 rounded-xl p-5">
                        <p className="text-xs text-muted uppercase mb-3 font-medium">Hizmetler / Ürünler</p>
                        <div className="space-y-3">
                            {items.map((it, i) => (
                                <div key={i} className="bg-[#0a0a0a] rounded-lg p-3">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex-1 space-y-1.5">
                                            <input value={it.name} onChange={e => upItem(i, "name", e.target.value)} placeholder="Hizmet adı"
                                                className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted/40" />
                                            <input value={it.description} onChange={e => upItem(i, "description", e.target.value)} placeholder="Açıklama"
                                                className="w-full bg-transparent text-xs text-muted focus:outline-none placeholder:text-muted/40" />
                                        </div>
                                        {items.length > 1 && (
                                            <button onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <p className="text-[10px] text-muted mb-1">Fiyat</p>
                                            <input type="number" min="0" step="0.01" value={it.price || ""} onChange={e => upItem(i, "price", Number(e.target.value))}
                                                className="w-full bg-[#111] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary/30" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted mb-1">Adet</p>
                                            <input type="number" min="1" value={it.qty} onChange={e => upItem(i, "qty", Number(e.target.value))}
                                                className="w-full bg-[#111] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary/30" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted mb-1">KDV</p>
                                            <select value={it.tax} onChange={e => upItem(i, "tax", Number(e.target.value))}
                                                className="w-full bg-[#111] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary/30">
                                                {taxOpts.map(t => <option key={t} value={t}>%{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setItems([...items, { ...blankItem }])}
                            className="flex items-center gap-2 text-xs text-primary font-medium mt-3 hover:text-primary/80">
                            <Plus className="w-3.5 h-3.5" /> Yeni Satır Ekle
                        </button>
                    </div>

                    {/* Discount */}
                    <div>
                        <p className="text-xs text-muted uppercase mb-1.5">İndirim</p>
                        <div className="flex gap-2">
                            <select value={discType} onChange={e => setDiscType(e.target.value)}
                                className="bg-[#111] border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30">
                                <option value="percent">%</option>
                                <option value="fixed">{cur.symbol}</option>
                            </select>
                            <input type="number" min="0" step="0.01" value={discVal || ""} onChange={e => setDiscVal(Number(e.target.value))} placeholder="0"
                                className="flex-1 bg-[#111] border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <p className="text-xs text-muted uppercase mb-1.5">Notlar</p>
                        <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ödeme koşulları…"
                            className="w-full bg-[#111] border border-white/5 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-primary/30" />
                    </div>

                    {/* ★ BUTTONS — Always clickable ★ */}
                    <div className="flex gap-3 pb-4">
                        <button
                            type="button"
                            onClick={() => save(false)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 cursor-pointer transition-colors"
                        >
                            <Save className="w-4 h-4" /> {saving ? "Kaydediliyor…" : "Taslak Kaydet"}
                        </button>
                        <button
                            type="button"
                            onClick={() => save(true)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold cursor-pointer transition-colors"
                        >
                            <Send className="w-4 h-4" /> Kaydet & Gönder
                        </button>
                    </div>
                </div>

                {/* ═══ RIGHT: PREVIEW ═══ */}
                <div className="flex-1 bg-[#0a0a0a] rounded-xl p-6 relative min-h-[600px]">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-bold text-muted">Önizleme</p>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => setZoom(z => Math.min(z + 0.1, 1.2))} className="w-8 h-8 rounded-lg bg-[#111] border border-white/10 flex items-center justify-center text-muted hover:text-foreground">
                                <ZoomIn className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.4))} className="w-8 h-8 rounded-lg bg-[#111] border border-white/10 flex items-center justify-center text-muted hover:text-foreground">
                                <ZoomOut className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center overflow-hidden">
                        <div className="bg-white text-[#1a1a1a] rounded-lg shadow-xl origin-top"
                            style={{ width: 595, minHeight: 842, transform: `scale(${zoom})`, transformOrigin: "top center", padding: 48 }}>
                            {/* Header */}
                            <div className="flex items-start justify-between mb-10">
                                <div>
                                    <h2 className="text-xl font-extrabold text-[#1a1a1a]">AKSE<span className="text-[#2563EB]">.</span></h2>
                                    <p className="text-[10px] text-gray-400 mt-1">Digital Agency</p>
                                </div>
                                <p className="text-xs font-mono text-gray-500">{pNo}</p>
                            </div>
                            {/* Info */}
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8 text-xs">
                                <div><p className="text-[10px] text-gray-400 uppercase mb-0.5">Konu</p><p className="font-medium">{subject || "—"}</p></div>
                                <div><p className="text-[10px] text-gray-400 uppercase mb-0.5">Son Tarih</p><p className="font-medium">{validUntil ? fmtDate(validUntil) : "—"}</p></div>
                                <div><p className="text-[10px] text-gray-400 uppercase mb-0.5">Müşteri</p><p className="font-medium">{name || "—"}</p>{email && <p className="text-gray-400 text-[10px]">{email}</p>}</div>
                                <div><p className="text-[10px] text-gray-400 uppercase mb-0.5">Para Birimi</p><p className="font-medium">{cur.flag} {cur.code}</p></div>
                            </div>
                            {/* Table */}
                            <table className="w-full text-xs mb-6">
                                <thead><tr className="border-b border-gray-200">
                                    <th className="text-left py-2 text-[10px] text-gray-400 uppercase font-medium">Hizmet</th>
                                    <th className="text-center py-2 text-[10px] text-gray-400 uppercase font-medium w-12">Adet</th>
                                    <th className="text-right py-2 text-[10px] text-gray-400 uppercase font-medium">Fiyat</th>
                                    <th className="text-right py-2 text-[10px] text-gray-400 uppercase font-medium">Toplam</th>
                                </tr></thead>
                                <tbody>{items.map((it, i) => (
                                    <tr key={i} className="border-b border-gray-100">
                                        <td className="py-2.5"><p className="font-medium">{it.name || "—"}</p>{it.description && <p className="text-[10px] text-gray-400">{it.description}</p>}</td>
                                        <td className="text-center py-2.5">{it.qty}</td>
                                        <td className="text-right py-2.5">{fmt(it.price)}</td>
                                        <td className="text-right py-2.5 font-medium">{fmt(it.qty * it.price)}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                            {/* Summary */}
                            <div className="flex justify-end">
                                <div className="w-52 space-y-1.5 text-xs">
                                    <div className="flex justify-between"><span className="text-gray-400">Ara Toplam</span><span>{fmt(sub)}</span></div>
                                    {discVal > 0 && <div className="flex justify-between text-red-500"><span>İndirim {discType === "percent" ? `%${discVal}` : ""}</span><span>-{fmt(discAmt)}</span></div>}
                                    <div className="flex justify-between"><span className="text-gray-400">KDV</span><span>{fmt(adjTax)}</span></div>
                                    <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-bold"><span>Genel Toplam</span><span>{fmt(total)}</span></div>
                                </div>
                            </div>
                            {notes && <div className="mt-8 pt-4 border-t border-gray-100"><p className="text-[10px] text-gray-400 uppercase mb-1">Notlar</p><p className="text-xs text-gray-500 whitespace-pre-line">{notes}</p></div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ SEND MODAL ═══ */}
            {showSend && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6">
                    <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold">📤 Teklif Gönder</h2>
                            <button onClick={() => setShowSend(false)} className="text-muted hover:text-foreground"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-5">
                            <button onClick={() => sendVia("whatsapp")} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                                <MessageSquare className="w-5 h-5" /><span className="text-[10px] font-medium">WhatsApp</span>
                            </button>
                            <button onClick={() => sendVia("email")} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                                <Mail className="w-5 h-5" /><span className="text-[10px] font-medium">E-posta</span>
                            </button>
                            <button onClick={() => sendVia("sms")} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors">
                                <Smartphone className="w-5 h-5" /><span className="text-[10px] font-medium">SMS</span>
                            </button>
                            <button onClick={() => sendVia("link")} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 text-foreground hover:bg-white/10 transition-colors">
                                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Link2 className="w-5 h-5" />}
                                <span className="text-[10px] font-medium">{copied ? "Kopyalandı" : "Link"}</span>
                            </button>
                        </div>
                        <div>
                            <p className="text-xs text-muted uppercase mb-1.5">Mesaj İçeriği</p>
                            <textarea rows={8} value={msg} onChange={e => setMsg(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary/30 font-mono" />
                        </div>
                        <button onClick={() => setShowSend(false)} className="w-full mt-4 py-2.5 rounded-xl bg-white/5 text-sm text-muted hover:text-foreground hover:bg-white/10 transition-colors">
                            Kapat
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
