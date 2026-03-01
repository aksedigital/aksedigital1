import { Reveal } from "@/components/Reveal";
import { createServerSupabase } from "@/lib/supabase-server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function BlogPage() {
    const supabase = await createServerSupabase();
    const { data: posts } = await supabase
        .from("posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

    return (
        <>
            {/* Hero */}
            <section className="pt-40 pb-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <Reveal>
                        <p className="text-muted text-sm font-medium uppercase tracking-widest mb-4">Blog</p>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[0.95]">
                            Dijital Dünyadan
                            <br />
                            <span className="text-primary">Güncel Yazılar</span>
                        </h1>
                    </Reveal>
                </div>
            </section>

            {/* Posts Grid */}
            <section className="px-6 pb-32">
                <div className="max-w-6xl mx-auto">
                    {!posts || posts.length === 0 ? (
                        <Reveal>
                            <div className="text-center py-20">
                                <p className="text-muted text-lg">Henüz blog yazısı yayınlanmadı.</p>
                                <p className="text-muted text-sm mt-2">Yakında yeni içerikler burada olacak!</p>
                            </div>
                        </Reveal>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post, i) => (
                                <Reveal key={post.id} delay={i * 0.1}>
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500"
                                    >
                                        {/* Cover Image */}
                                        {post.cover_url ? (
                                            <div className="aspect-video overflow-hidden">
                                                <img
                                                    src={post.cover_url}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                                <span className="text-4xl font-extrabold text-white/10">{post.title?.charAt(0)}</span>
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                {post.category && (
                                                    <span className="text-xs text-primary font-medium uppercase tracking-widest">
                                                        {post.category}
                                                    </span>
                                                )}
                                                <span className="text-xs text-muted">{formatDate(post.created_at)}</span>
                                            </div>
                                            <h2 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                                                {post.title}
                                            </h2>
                                            {post.excerpt && (
                                                <p className="text-sm text-muted line-clamp-2">{post.excerpt}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-4 text-xs text-primary font-medium">
                                                Devamını Oku
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                </Reveal>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
