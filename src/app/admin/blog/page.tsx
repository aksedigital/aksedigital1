"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Plus, Search, Trash2, Edit, X, Eye, EyeOff, Save } from "lucide-react";

interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    cover_url: string;
    published: boolean;
    created_at: string;
}

const defaultForm = { title: "", slug: "", excerpt: "", content: "", category: "", cover_url: "", published: false };

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showEditor, setShowEditor] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(defaultForm);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    const fetchPosts = async () => {
        const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
        setPosts(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchPosts(); }, []);

    const generateSlug = (title: string) =>
        title
            .toLowerCase()
            .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
            .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();

    const handleTitleChange = (title: string) => {
        setForm({ ...form, title, slug: editId ? form.slug : generateSlug(title) });
    };

    const handleSave = async () => {
        if (!form.title || !form.slug) return;
        setSaving(true);
        if (editId) {
            await supabase.from("posts").update({ ...form, updated_at: new Date().toISOString() }).eq("id", editId);
        } else {
            await supabase.from("posts").insert(form);
        }
        setSaving(false);
        setShowEditor(false);
        setEditId(null);
        setForm(defaultForm);
        fetchPosts();
    };

    const handleEdit = (p: Post) => {
        setForm({
            title: p.title, slug: p.slug, excerpt: p.excerpt || "",
            content: p.content || "", category: p.category || "",
            cover_url: p.cover_url || "", published: p.published,
        });
        setEditId(p.id);
        setShowEditor(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu yazıyı silmek istediğinize emin misiniz?")) return;
        await supabase.from("posts").delete().eq("id", id);
        fetchPosts();
    };

    const togglePublish = async (id: string, published: boolean) => {
        await supabase.from("posts").update({ published: !published }).eq("id", id);
        fetchPosts();
    };

    const openNew = () => {
        setForm(defaultForm);
        setEditId(null);
        setShowEditor(true);
    };

    const filtered = posts.filter(
        (p) => p.title?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase())
    );

    const formatDate = (d: string) => new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });

    // Editor view
    if (showEditor) {
        return (
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-extrabold">{editId ? "Yazı Düzenle" : "Yeni Yazı"}</h1>
                    <button onClick={() => { setShowEditor(false); setEditId(null); setForm(defaultForm); }} className="text-muted hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs text-muted uppercase mb-1.5">Başlık *</label>
                            <input
                                type="text" value={form.title} onChange={(e) => handleTitleChange(e.target.value)}
                                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                                placeholder="Blog yazı başlığı"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-muted uppercase mb-1.5">Slug *</label>
                            <input
                                type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                                placeholder="blog-yazi-basligi"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs text-muted uppercase mb-1.5">Kategori</label>
                            <input
                                type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                                placeholder="SEO, Web Tasarım, Dijital Pazarlama..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-muted uppercase mb-1.5">Kapak Görseli URL</label>
                            <input
                                type="text" value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
                                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-muted uppercase mb-1.5">Özet</label>
                        <textarea
                            rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                            placeholder="Kısa bir özet (blog listesinde görünür)"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-muted uppercase mb-1.5">İçerik</label>
                        <textarea
                            rows={12} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none font-mono"
                            placeholder="Blog yazısı içeriği... (HTML destekli)"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox" checked={form.published}
                                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                                className="w-4 h-4 rounded border-white/20 bg-[#111] text-primary focus:ring-primary"
                            />
                            <span className="text-sm">Yayınla</span>
                        </label>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => { setShowEditor(false); setEditId(null); setForm(defaultForm); }}
                            className="px-6 py-2.5 rounded-xl border border-white/10 text-sm text-muted hover:text-foreground transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleSave} disabled={saving || !form.title || !form.slug}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? "Kaydediliyor..." : editId ? "Güncelle" : "Kaydet"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // List view
    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold">Blog Yazıları</h1>
                    <p className="text-sm text-muted mt-1">{posts.length} yazı</p>
                </div>
                <button onClick={openNew} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
                    <Plus className="w-4 h-4" />
                    Yeni Yazı
                </button>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                    type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Yazı ara..."
                    className="w-full bg-[#111] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                />
            </div>

            <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left px-5 py-3 text-xs text-muted uppercase font-medium">Başlık</th>
                                <th className="text-left px-5 py-3 text-xs text-muted uppercase font-medium hidden md:table-cell">Kategori</th>
                                <th className="text-left px-5 py-3 text-xs text-muted uppercase font-medium hidden lg:table-cell">Tarih</th>
                                <th className="text-left px-5 py-3 text-xs text-muted uppercase font-medium">Durum</th>
                                <th className="text-right px-5 py-3 text-xs text-muted uppercase font-medium">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-12 text-muted">Yükleniyor...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-12 text-muted">{search ? "Sonuç bulunamadı." : "Henüz yazı yok."}</td></tr>
                            ) : (
                                filtered.map((p) => (
                                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-3.5">
                                            <p className="font-medium">{p.title}</p>
                                            <p className="text-xs text-muted truncate max-w-xs">{p.excerpt}</p>
                                        </td>
                                        <td className="px-5 py-3.5 text-muted hidden md:table-cell">
                                            {p.category && <span className="text-xs bg-white/5 px-2 py-1 rounded-full">{p.category}</span>}
                                        </td>
                                        <td className="px-5 py-3.5 text-muted text-xs hidden lg:table-cell">{formatDate(p.created_at)}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${p.published ? "text-emerald-400 bg-emerald-500/10" : "text-yellow-400 bg-yellow-500/10"}`}>
                                                {p.published ? "Yayında" : "Taslak"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => togglePublish(p.id, p.published)} className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-foreground transition-colors" title={p.published ? "Yayından kaldır" : "Yayınla"}>
                                                    {p.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                                <button onClick={() => handleEdit(p)} className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-primary transition-colors">
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors">
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
        </div>
    );
}
