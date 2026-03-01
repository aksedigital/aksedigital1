"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    TrendingUp, TrendingDown, Plus, Trash2, Pencil, Search, X, Filter
} from "lucide-react";

interface Transaction {
    id: string; type: string; amount: number; description: string; date: string;
    customer_name?: string; invoice_no?: string; payment_method: string;
    status: string; notes?: string; category_id?: string;
    finance_categories?: { name: string; color: string };
}
interface Category { id: string; name: string; type: string; color: string; }

function formatMoney(n: number) {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0 }).format(n);
}

const PAYMENT_LABELS: Record<string, string> = { nakit: "Nakit", havale: "Havale", kart: "Kart", cek: "Çek", diger: "Diğer" };
const STATUS_LABELS: Record<string, { label: string; css: string }> = {
    paid: { label: "Ödendi", css: "bg-emerald-500/10 text-emerald-400" },
    pending: { label: "Bekliyor", css: "bg-yellow-500/10 text-yellow-400" },
    overdue: { label: "Gecikmiş", css: "bg-red-500/10 text-red-400" },
};

const CATEGORY_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#22c55e", "#ef4444", "#f97316", "#3b82f6", "#a855f7"];

function TransactionPage({ txType }: { txType: "income" | "expense" }) {
    const searchParams = useSearchParams();
    const isIncome = txType === "income";
    const [items, setItems] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [customers, setCustomers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(searchParams.get("new") === "1");
    const [editItem, setEditItem] = useState<Transaction | null>(null);
    const [showNewCat, setShowNewCat] = useState(false);
    const [newCatName, setNewCatName] = useState("");
    const [newCatColor, setNewCatColor] = useState("#6366f1");
    const [customerSearch, setCustomerSearch] = useState("");
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

    const [form, setForm] = useState({
        amount: "", description: "", date: new Date().toISOString().split("T")[0],
        customer_name: "", invoice_no: "", payment_method: "havale",
        status: "paid", notes: "", category_id: "",
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [txRes, catRes, custRes] = await Promise.all([
            fetch(`/api/finance?type=${txType}`).then(r => r.json()),
            fetch(`/api/finance?action=categories&type=${txType}`).then(r => r.json()),
            fetch(`/api/finance?action=customers`).then(r => r.json()),
        ]);
        if (txRes.success) setItems(txRes.data || []);
        if (catRes.success) setCategories(catRes.data || []);
        if (custRes.success) setCustomers(custRes.data || []);
        setLoading(false);
    }, [txType]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openNew = () => {
        setEditItem(null);
        setForm({ amount: "", description: "", date: new Date().toISOString().split("T")[0], customer_name: "", invoice_no: "", payment_method: "havale", status: "paid", notes: "", category_id: categories[0]?.id || "" });
        setCustomerSearch("");
        setShowModal(true);
    };

    const openEdit = (t: Transaction) => {
        setEditItem(t);
        setForm({
            amount: t.amount.toString(), description: t.description || "", date: t.date,
            customer_name: t.customer_name || "", invoice_no: t.invoice_no || "",
            payment_method: t.payment_method, status: t.status, notes: t.notes || "",
            category_id: t.category_id || "",
        });
        setCustomerSearch(t.customer_name || "");
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.amount || parseFloat(form.amount) <= 0) return alert("Tutar giriniz");
        const body = editItem
            ? { action: "updateTransaction", id: editItem.id, ...form, amount: parseFloat(form.amount), type: txType }
            : { action: "createTransaction", ...form, amount: parseFloat(form.amount), type: txType };
        setShowModal(false);
        await fetch("/api/finance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        fetchData();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Silmek istediğinize emin misiniz?")) return;
        await fetch("/api/finance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "deleteTransaction", id }) });
        fetchData();
    };

    const handleCreateCategory = async () => {
        if (!newCatName.trim()) return;
        const res = await fetch("/api/finance", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "createCategory", name: newCatName.trim(), type: txType, color: newCatColor }),
        });
        const d = await res.json();
        if (d.success && d.data) {
            setCategories([...categories, d.data]);
            setForm({ ...form, category_id: d.data.id });
        }
        setShowNewCat(false);
        setNewCatName("");
    };

    const filteredCustomers = customers.filter(c =>
        c.toLowerCase().includes((customerSearch || "").toLowerCase())
    ).slice(0, 8);

    const filtered = items.filter(i =>
        (i.description || "").toLowerCase().includes(search.toLowerCase()) ||
        (i.customer_name || "").toLowerCase().includes(search.toLowerCase())
    );

    const total = filtered.reduce((s, i) => s + Number(i.amount), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${isIncome ? "bg-emerald-500/20" : "bg-red-500/20"} flex items-center justify-center`}>
                        {isIncome ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-red-400" />}
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold">{isIncome ? "Gelirler" : "Giderler"}</h1>
                        <p className="text-xs text-muted">{filtered.length} kayıt • Toplam: {formatMoney(total)}</p>
                    </div>
                </div>
                <button onClick={openNew}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isIncome ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}>
                    <Plus className="w-4 h-4" /> {isIncome ? "Gelir Ekle" : "Gider Ekle"}
                </button>
            </div>

            {/* Search */}
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Açıklama veya müşteri ara..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary/30" />
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                    <Filter className="w-12 h-12 text-muted/20 mx-auto mb-3" />
                    <p className="text-sm text-muted">Kayıt bulunamadı</p>
                    <button onClick={openNew}
                        className={`mt-3 text-xs px-4 py-2 rounded-xl ${isIncome ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}>
                        <Plus className="w-3 h-3 inline mr-1" /> İlk {isIncome ? "geliri" : "gideri"} ekleyin
                    </button>
                </div>
            ) : (
                <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 text-muted text-xs">
                                    <th className="text-left px-4 py-3 font-medium">Tarih</th>
                                    <th className="text-left px-4 py-3 font-medium">Açıklama</th>
                                    <th className="text-left px-4 py-3 font-medium">Kategori</th>
                                    <th className="text-left px-4 py-3 font-medium">Müşteri</th>
                                    <th className="text-left px-4 py-3 font-medium">Ödeme</th>
                                    <th className="text-left px-4 py-3 font-medium">Durum</th>
                                    <th className="text-right px-4 py-3 font-medium">Tutar</th>
                                    <th className="text-right px-4 py-3 font-medium">İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((t) => {
                                    const st = STATUS_LABELS[t.status] || STATUS_LABELS.paid;
                                    return (
                                        <tr key={t.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 py-3 text-xs text-muted">{new Date(t.date).toLocaleDateString("tr-TR")}</td>
                                            <td className="px-4 py-3">
                                                <p className="text-xs font-medium truncate max-w-48">{t.description || "—"}</p>
                                                {t.invoice_no && <p className="text-[10px] text-muted">#{t.invoice_no}</p>}
                                            </td>
                                            <td className="px-4 py-3">
                                                {t.finance_categories ? (
                                                    <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: `${t.finance_categories.color}15`, color: t.finance_categories.color }}>
                                                        {t.finance_categories.name}
                                                    </span>
                                                ) : "—"}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted truncate max-w-32">{t.customer_name || "—"}</td>
                                            <td className="px-4 py-3 text-xs text-muted">{PAYMENT_LABELS[t.payment_method] || t.payment_method}</td>
                                            <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${st.css}`}>{st.label}</span></td>
                                            <td className={`px-4 py-3 text-right font-bold text-sm ${isIncome ? "text-emerald-400" : "text-red-400"}`}>
                                                {isIncome ? "+" : "-"}{formatMoney(t.amount)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center gap-1 justify-end">
                                                    <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold">{editItem ? "Düzenle" : (isIncome ? "Gelir Ekle" : "Gider Ekle")}</h3>
                            <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-muted" /></button>
                        </div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] text-muted mb-1 block">Tutar (₺) *</label>
                                    <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="text-[11px] text-muted mb-1 block">Tarih *</label>
                                    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] text-muted mb-1 block">Açıklama</label>
                                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" placeholder="Açıklama..." />
                            </div>

                            {/* Category with inline create */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-[11px] text-muted">Kategori</label>
                                    <button onClick={() => setShowNewCat(!showNewCat)} className="text-[10px] text-primary hover:underline">
                                        + Yeni Kategori
                                    </button>
                                </div>
                                {showNewCat ? (
                                    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3 space-y-2">
                                        <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                                            placeholder="Kategori adı..."
                                            autoFocus onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/30" />
                                        <div className="flex items-center gap-1.5">
                                            {CATEGORY_COLORS.map(c => (
                                                <button key={c} onClick={() => setNewCatColor(c)}
                                                    className={`w-5 h-5 rounded-full transition-all ${newCatColor === c ? "ring-2 ring-white ring-offset-1 ring-offset-[#111] scale-110" : ""}`}
                                                    style={{ background: c }} />
                                            ))}
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => setShowNewCat(false)} className="text-xs text-muted hover:text-foreground px-2 py-1">İptal</button>
                                            <button onClick={handleCreateCategory} className="text-xs bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary/90">Oluştur</button>
                                        </div>
                                    </div>
                                ) : (
                                    <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                                        <option value="" className="bg-[#111]">Kategori seçiniz</option>
                                        {categories.map(c => <option key={c.id} value={c.id} className="bg-[#111]">{c.name}</option>)}
                                    </select>
                                )}
                            </div>

                            {/* Customer with autocomplete */}
                            <div className="relative">
                                <label className="text-[11px] text-muted mb-1 block">Müşteri / Firma</label>
                                <input value={customerSearch} onChange={(e) => {
                                    setCustomerSearch(e.target.value);
                                    setForm({ ...form, customer_name: e.target.value });
                                    setShowCustomerDropdown(true);
                                }}
                                    onFocus={() => setShowCustomerDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" placeholder="Müşteri adı yazın veya seçin..." />
                                {showCustomerDropdown && customerSearch.trim().length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-10 max-h-48 overflow-y-auto">
                                        {filteredCustomers.length > 0 && filteredCustomers.map((c) => (
                                            <button key={c} onMouseDown={(e) => { e.preventDefault(); setCustomerSearch(c); setForm({ ...form, customer_name: c }); setShowCustomerDropdown(false); }}
                                                className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 text-muted hover:text-foreground transition-colors">
                                                {c}
                                            </button>
                                        ))}
                                        {!filteredCustomers.includes(customerSearch.trim()) && (
                                            <button onMouseDown={(e) => { e.preventDefault(); setForm({ ...form, customer_name: customerSearch.trim() }); setShowCustomerDropdown(false); }}
                                                className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 text-primary transition-colors flex items-center gap-1.5 border-t border-white/5">
                                                <Plus className="w-3 h-3" /> &quot;{customerSearch.trim()}&quot; yeni müşteri olarak ekle
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] text-muted mb-1 block">Ödeme Yöntemi</label>
                                    <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                                        {Object.entries(PAYMENT_LABELS).map(([k, v]) => <option key={k} value={k} className="bg-[#111]">{v}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] text-muted mb-1 block">Fatura No</label>
                                    <input value={form.invoice_no} onChange={(e) => setForm({ ...form, invoice_no: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" placeholder="F-001" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] text-muted mb-1 block">Durum</label>
                                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                                    <option value="paid" className="bg-[#111]">Ödendi</option>
                                    <option value="pending" className="bg-[#111]">Bekliyor</option>
                                    <option value="overdue" className="bg-[#111]">Gecikmiş</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[11px] text-muted mb-1 block">Notlar</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30 resize-none" placeholder="Ek notlar..." />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end mt-5">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm text-muted hover:bg-white/5">İptal</button>
                            <button onClick={handleSave}
                                className={`px-5 py-2 rounded-xl text-sm font-medium text-white ${isIncome ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}`}>
                                {editItem ? "Güncelle" : "Kaydet"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function IncomePage() {
    return <Suspense><TransactionPage txType="income" /></Suspense>;
}

export function ExpensePage() {
    return <Suspense><TransactionPage txType="expense" /></Suspense>;
}
