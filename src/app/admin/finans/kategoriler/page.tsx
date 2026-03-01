"use client";

import { useState, useEffect, useCallback } from "react";
import { Receipt, Plus, Trash2, X } from "lucide-react";

interface Category {
    id: string; name: string; type: string; color: string; icon: string;
}

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#22c55e", "#ef4444", "#f97316", "#3b82f6", "#a855f7", "#dc2626", "#6b7280"];

export default function KategorilerPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: "", type: "income", color: "#6366f1" });

    const fetchData = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/finance?action=categories");
        const d = await res.json();
        if (d.success) setCategories(d.data || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCreate = async () => {
        if (!form.name.trim()) return;
        const name = form.name.trim();
        setShowModal(false);
        setForm({ name: "", type: "income", color: "#6366f1" });
        await fetch("/api/finance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "createCategory", ...form, name }) });
        fetchData();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;
        await fetch("/api/finance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "deleteCategory", id }) });
        fetchData();
    };

    const incomeCategories = categories.filter(c => c.type === "income");
    const expenseCategories = categories.filter(c => c.type === "expense");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold">Kategoriler</h1>
                        <p className="text-xs text-muted">Gelir ve gider kategorileri</p>
                    </div>
                </div>
                <button onClick={() => { setForm({ name: "", type: "income", color: "#6366f1" }); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" /> Yeni Kategori
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Income Categories */}
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" /> Gelir Kategorileri
                            <span className="text-xs text-muted font-normal ml-auto">{incomeCategories.length} kategori</span>
                        </h3>
                        <div className="space-y-2">
                            {incomeCategories.map(cat => (
                                <div key={cat.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors group">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                                    <span className="text-sm flex-1">{cat.name}</span>
                                    <button onClick={() => handleDelete(cat.id)}
                                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-muted hover:text-red-400 transition-all">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                            {incomeCategories.length === 0 && <p className="text-xs text-muted text-center py-4">Kategori yok</p>}
                        </div>
                    </div>

                    {/* Expense Categories */}
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-400" /> Gider Kategorileri
                            <span className="text-xs text-muted font-normal ml-auto">{expenseCategories.length} kategori</span>
                        </h3>
                        <div className="space-y-2">
                            {expenseCategories.map(cat => (
                                <div key={cat.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors group">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                                    <span className="text-sm flex-1">{cat.name}</span>
                                    <button onClick={() => handleDelete(cat.id)}
                                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-muted hover:text-red-400 transition-all">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                            {expenseCategories.length === 0 && <p className="text-xs text-muted text-center py-4">Kategori yok</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold">Yeni Kategori</h3>
                            <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-muted" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[11px] text-muted mb-1 block">Kategori Adı *</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    autoFocus onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/30" placeholder="Kategori adı" />
                            </div>
                            <div>
                                <label className="text-[11px] text-muted mb-1 block">Tür</label>
                                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                                    <option value="income" className="bg-[#111]">Gelir</option>
                                    <option value="expense" className="bg-[#111]">Gider</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[11px] text-muted mb-1 block">Renk</label>
                                <div className="flex flex-wrap gap-2">
                                    {COLORS.map(c => (
                                        <button key={c} onClick={() => setForm({ ...form, color: c })}
                                            className={`w-7 h-7 rounded-lg transition-all ${form.color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#111] scale-110" : "hover:scale-105"}`}
                                            style={{ background: c }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end mt-5">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm text-muted hover:bg-white/5">İptal</button>
                            <button onClick={handleCreate} className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium">Oluştur</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
