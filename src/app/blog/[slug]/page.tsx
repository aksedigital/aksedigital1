import { createServerSupabase } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import type { Metadata } from "next";

export const revalidate = 60;

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createServerSupabase();
    const { data: post } = await supabase
        .from("posts")
        .select("title, excerpt")
        .eq("slug", slug)
        .eq("published", true)
        .single();

    if (!post) return { title: "Yazı Bulunamadı" };

    return {
        title: post.title,
        description: post.excerpt || "",
    };
}

export default async function BlogDetailPage({ params }: Props) {
    const { slug } = await params;
    const supabase = await createServerSupabase();

    const { data: post } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

    if (!post) notFound();

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

    return (
        <>
            {/* Hero */}
            <section className="pt-40 pb-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <Reveal>
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mb-8"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Blog&apos;a Dön
                        </Link>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <div className="flex items-center gap-4 mb-6">
                            {post.category && (
                                <span className="flex items-center gap-1.5 text-xs text-primary font-medium uppercase tracking-widest">
                                    <Tag className="w-3 h-3" />
                                    {post.category}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5 text-xs text-muted">
                                <Calendar className="w-3 h-3" />
                                {formatDate(post.created_at)}
                            </span>
                        </div>
                    </Reveal>

                    <Reveal delay={0.15}>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6">
                            {post.title}
                        </h1>
                    </Reveal>

                    {post.excerpt && (
                        <Reveal delay={0.2}>
                            <p className="text-lg text-muted leading-relaxed">{post.excerpt}</p>
                        </Reveal>
                    )}
                </div>
            </section>

            {/* Cover Image */}
            {post.cover_url && (
                <section className="px-6 pb-12">
                    <div className="max-w-4xl mx-auto">
                        <Reveal delay={0.25}>
                            <div className="aspect-video rounded-2xl overflow-hidden">
                                <img
                                    src={post.cover_url}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </Reveal>
                    </div>
                </section>
            )}

            {/* Content */}
            <section className="px-6 pb-32">
                <div className="max-w-3xl mx-auto">
                    <Reveal delay={0.3}>
                        <div
                            className="prose prose-invert prose-lg max-w-none 
                                       prose-headings:font-extrabold prose-headings:text-foreground
                                       prose-p:text-muted prose-p:leading-relaxed
                                       prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                                       prose-strong:text-foreground
                                       prose-li:text-muted
                                       prose-blockquote:border-primary prose-blockquote:text-muted
                                       prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
                            dangerouslySetInnerHTML={{ __html: post.content || "" }}
                        />
                    </Reveal>

                    {/* Back Link */}
                    <Reveal delay={0.35}>
                        <div className="mt-16 pt-8 border-t border-border">
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Tüm Yazılar
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>
        </>
    );
}
