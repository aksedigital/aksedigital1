"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Package, Plus, Trash2, Pencil, Search, X, AlertTriangle
} from "lucide-react";

interface StockItem {
    id: string; name: string; sku?: string; category?: string; quantity: number;
    unit: string; buy_price: number; sell_price: number; min_stock: number;
    supplier?: string; notes?: string;
}

function formatMoney(n: number) {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0 }).format(n);
}

export default function StokPage() {
    const [items, setItems] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<StockItem | null>(null);
    const [form, setForm] = useState({
        name: "", sku: "", category: "", quantity: "0", unit: "adet",
        buy_price: "0", sell_price: "0", min_stock: "5", supplier: "", notes: "",
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/finance?action=stock");
        const d = await res.json();
        if (d.success) setItems(d.data || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openNew = () => {
        setEditItem(null);
        setForm({ name: "", sku: "", category: "", quantity: "0", unit: "adet", buy_price: "0", sell_price: "0", min_stock: "5", supplier: "", notes: "" });
        setShowModal(true);
    };

    const openEdit = (item: StockItem) => {
        setEditItem(item);
        setForm({
            name: item.name, sku: item.sku || "", category: item.category || "",
            quantity: item.quantity.toString(), unit: item.unit, buy_price: item.buy_price.toString(),
            sell_price: item.sell_price.toString(), min_stock: item.min_stock.toString(),
            supplier: item.supplier || "", notes: item.notes || "",
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return alert("Ürün adı giriniz");
        const body = editItem
            ? { action: "updateStock", id: editItem.id, ...form, quantity: parseInt(form.quantity), buy_price: parseFloat(form.buy_price), sell_price: parseFloat(form.sell_price), min_stock: parseInt(form.min_stock) }
            : { action: "createStock", ...form, quantity: parseInt(form.quantity), buy_price: parseFloat(form.buy_price), sell_price: parseFloat(form.sell_price), min_stock: parseInt(form.min_stock) };
        await fetch("/api/finance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        setShowModal(false);
        fetchData();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Silmek istediğinize emin misiniz?")) return;
        await fetch("/api/finance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "deleteStock", id }) });
        fetchData();
    };

    const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || (i.sku || "").toLowerCase().includes(search.toLowerCase()));
    const lowStock = items.filter(i => i.quantity <= i.min_stock);
    const totalValue = items.reduce((s, i) => s + i.quantity * i.sell_price, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold">Stok Takibi</h1>
                        <p className="text-xs text-muted">{items.length} ürün • Toplam Değer: {formatMoney(totalValue)}</p>
                    </div>
                </div>
                <button onClick={openNew}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" /> Ürün Ekle
                </button>
            </div>

            {/* Low Stock Alert */}
            {lowStock.length > 0 && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-yellow-400">Düşük Stok Uyarısı</p>
                        <p className="text-xs text-muted mt-1">
                            {lowStock.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(", ")}
                        </p>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ürün adı veya SKU ara..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary/30" />
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
            ) : (
                <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 text-muted text-xs">
                                    <th className="text-left px-4 py-3 font-medium">Ürün</th>
                                    <th className="text-left px-4 py-3 font-medium">SKU</th>
                                    <th className="text-left px-4 py-3 font-medium">Kategori</th>
                                    <th className="text-center px-4 py-3 font-medium">Stok</th>
                                    <th className="text-right px-4 py-3 font-medium">Alış</th>
                                    <th className="text-right px-4 py-3 font-medium">Satış</th>
                                    <th className="text-left px-4 py-3 font-medium">Tedarikçi</th>
                                    <th className="text-right px-4 py-3 font-medium">İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((item) => {
                                    const isLow = item.quantity <= item.min_stock;
                                    return (
                                        <tr key={item.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="text-xs font-medium">{item.name}</p>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted">{item.sku || "—"}</td>
                                            <td className="px-4 py-3 text-xs text-muted">{item.category || "—"}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-xs font-bold ${isLow ? "text-red-400" : "text-emerald-400"}`}>
                                                    {item.quantity} {item.unit}
                                                </span>
                                                {isLow && <AlertTriangle className="w-3 h-3 text-yellow-400 inline ml-1" />}
                                            </td>
                                            <td className="px-4 py-3 text-right text-xs text-muted">{formatMoney(item.buy_price)}</td>
                                            <td className="px-4 py-3 text-right text-xs font-medium">{formatMoney(item.sell_price)}</td>
                                            <td className="px-4 py-3 text-xs text-muted truncate max-w-32">{item.supplier || "—"}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center gap-1 justify-end">
                                                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
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
                            <h3 className="font-bold">{editItem ? "Ürün Düzenle" : "Yeni Ürün"}</h3>
                            <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-muted" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[11px] text-muted mb-1 block">Ürün Adı *</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" placeholder="Ürün adı" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] text-muted mb-1 block">SKU</label>
                                    <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" placeholder="SKU-001" />
                                </div>
                                <div>
                                    <label className="text-[11px] text-muted mb-1 block">Kategori</label>
                                    <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" placeholder="Kategori" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[11px] text-muted mb-1 block">Miktar</label>
                                    <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                                </div>
                                <div>
                                    <label className="text-[11px] text-muted mb-1 block">Birim</label>
                                    <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                                        {["adet", "saat", "paket", "kg", "lt", "m²"].map(u => <option key={u} value={u} className="bg-[#111]">{u}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] text-muted mb-1 block">Min Stok</label>
                                    <input type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] text-muted mb-1 block">Alış Fiyatı (₺)</label>
                                    <input type="number" value={form.buy_price} onChange={(e) => setForm({ ...form, buy_price: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                                </div>
                                <div>
                                    <label className="text-[11px] text-muted mb-1 block">Satış Fiyatı (₺)</label>
                                    <input type="number" value={form.sell_price} onChange={(e) => setForm({ ...form, sell_price: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] text-muted mb-1 block">Tedarikçi</label>
                                <input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" placeholder="Tedarikçi firma" />
                            </div>
                            <div>
                                <label className="text-[11px] text-muted mb-1 block">Notlar</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30 resize-none" />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end mt-5">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm text-muted hover:bg-white/5">İptal</button>
                            <button onClick={handleSave} className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium">
                                {editItem ? "Güncelle" : "Kaydet"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
