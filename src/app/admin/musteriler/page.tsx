"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Plus, Search, Trash2, Edit, X } from "lucide-react";

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    tax_no: string;
    created_at: string;
}

export default function MusterilerPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", tax_no: "" });
    const supabase = createClient();

    const fetchCustomers = async () => {
        const { data } = await supabase
            .from("customers")
            .select("*")
            .order("created_at", { ascending: false });
        setCustomers(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSave = async () => {
        if (editId) {
            await supabase.from("customers").update(form).eq("id", editId);
        } else {
            await supabase.from("customers").insert(form);
        }
        setShowModal(false);
        setEditId(null);
        setForm({ name: "", email: "", phone: "", company: "", tax_no: "" });
        fetchCustomers();
    };

    const handleEdit = (c: Customer) => {
        setForm({ name: c.name, email: c.email, phone: c.phone, company: c.company, tax_no: c.tax_no });
        setEditId(c.id);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) return;
        await supabase.from("customers").delete().eq("id", id);
        fetchCustomers();
    };

    const openAdd = () => {
        setForm({ name: "", email: "", phone: "", company: "", tax_no: "" });
        setEditId(null);
        setShowModal(true);
    };

    const filtered = customers.filter(
        (c) =>
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase()) ||
            c.company?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Müşteriler</h1>
                    <p className="text-sm text-muted mt-1">Müşteri listenizi yönetin.</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Müşteri
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Müşteri ara..."
                    className="w-full bg-[#111] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                />
            </div>

            {/* Table */}
            <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left px-5 py-3 text-xs text-muted uppercase tracking-widest font-medium">Ad</th>
                                <th className="text-left px-5 py-3 text-xs text-muted uppercase tracking-widest font-medium">E-posta</th>
                                <th className="text-left px-5 py-3 text-xs text-muted uppercase tracking-widest font-medium hidden md:table-cell">Telefon</th>
                                <th className="text-left px-5 py-3 text-xs text-muted uppercase tracking-widest font-medium hidden lg:table-cell">Şirket</th>
                                <th className="text-right px-5 py-3 text-xs text-muted uppercase tracking-widest font-medium">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-muted">Yükleniyor...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-muted">
                                        {search ? "Sonuç bulunamadı." : "Henüz müşteri eklenmemiş."}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((c) => (
                                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-3.5 font-medium">{c.name}</td>
                                        <td className="px-5 py-3.5 text-muted">{c.email}</td>
                                        <td className="px-5 py-3.5 text-muted hidden md:table-cell">{c.phone}</td>
                                        <td className="px-5 py-3.5 text-muted hidden lg:table-cell">{c.company}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleEdit(c)}
                                                    className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-primary transition-colors"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(c.id)}
                                                    className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
                    <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold">{editId ? "Müşteri Düzenle" : "Yeni Müşteri"}</h2>
                            <button onClick={() => setShowModal(false)} className="text-muted hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { key: "name", label: "Ad Soyad", placeholder: "Müşteri adı", required: true },
                                { key: "email", label: "E-posta", placeholder: "ornek@email.com" },
                                { key: "phone", label: "Telefon", placeholder: "+90 5XX XXX XX XX" },
                                { key: "company", label: "Şirket", placeholder: "Şirket adı" },
                                { key: "tax_no", label: "Vergi No", placeholder: "Vergi numarası" },
                            ].map((field) => (
                                <div key={field.key}>
                                    <label className="block text-xs text-muted uppercase tracking-widest mb-1.5">
                                        {field.label}
                                    </label>
                                    <input
                                        type="text"
                                        value={form[field.key as keyof typeof form]}
                                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                        placeholder={field.placeholder}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-muted hover:text-foreground transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors"
                            >
                                {editId ? "Güncelle" : "Kaydet"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
