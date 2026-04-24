import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Calendar, ArrowLeft, BookOpen } from "lucide-react";
import { getPublishedBlogPostBySlug, type BlogPost } from "@/lib/adminFirestore";
import { useSEO } from "@/hooks/useSEO";
import { SITE_URL, ROUTES } from "@/lib/constants";

const WA_NUMBER = "5519996525211";
const WA_MSG = "Olá! Vim pelo blog da Átria e gostaria de saber mais sobre os veículos.";

function fmtDate(ts: { toDate?: () => Date } | null) {
  if (!ts || !ts.toDate) return "";
  return ts.toDate().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

// Simple markdown-to-HTML (handles ##, **, [], links)
function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-atria-navy underline hover:text-atria-navy/80">$1</a>')
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useSEO({
    title: post?.meta_title || "Blog | Átria Veículos",
    description: post?.meta_description || "Artigo sobre carros usados e seminovos em Campinas SP.",
    path: post ? `/blog/${post.slug}` : "/blog",
    ogType: "article",
  });

  useEffect(() => {
    if (!slug) return;
    getPublishedBlogPostBySlug(slug)
      .then((p) => { if (!p) setNotFound(true); else setPost(p); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // Schema Article JSON-LD
  useEffect(() => {
    if (!post) return;
    const old = document.getElementById("schema-blog-article");
    if (old) old.remove();
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.titulo,
      "description": post.meta_description,
      "url": `${SITE_URL}/blog/${post.slug}`,
      "datePublished": post.data_publicacao?.toDate?.()?.toISOString() || "",
      "dateCreated": post.data_criacao?.toDate?.()?.toISOString() || "",
      "author": { "@type": "Organization", "name": "Átria Veículos" },
      "publisher": {
        "@type": "Organization",
        "name": "Átria Veículos",
        "url": SITE_URL,
      },
      "keywords": post.keywords.join(", "),
    };
    const s = document.createElement("script");
    s.id = "schema-blog-article"; s.type = "application/ld+json";
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
    return () => { document.getElementById("schema-blog-article")?.remove(); };
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-atria-navy animate-spin" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <BookOpen size={56} className="text-slate-300" />
        <h1 className="font-barlow-condensed font-black text-3xl text-slate-900">Artigo nao encontrado</h1>
        <p className="font-inter text-slate-500">Este artigo pode ter sido removido ou o link esta incorreto.</p>
        <a href="/blog" className="bg-atria-navy text-white font-medium px-6 py-2.5 rounded-xl mt-2 hover:bg-atria-navy/90 transition">
          Ver todos os artigos
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-atria-navy via-atria-navy to-slate-800 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <a href="/blog" className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm mb-6 transition">
            <ArrowLeft size={14} /> Voltar pro blog
          </a>
          <h1 className="font-barlow-condensed font-black text-3xl md:text-4xl text-white mb-3">
            {post.titulo}
          </h1>
          <div className="flex items-center gap-3 text-white/50 text-sm">
            {post.data_publicacao && (
              <span className="flex items-center gap-1"><Calendar size={14} /> {fmtDate(post.data_publicacao)}</span>
            )}
            <span className="bg-white/10 px-2.5 py-0.5 rounded-full">{post.categoria}</span>
          </div>
        </div>
      </section>

      {/* Cover image */}
      {post.capa && (
        <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-10">
          <img src={post.capa} alt={post.titulo} className="w-full aspect-[16/9] object-cover rounded-2xl shadow-lg" />
        </div>
      )}

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 py-12">
        <div
          className="prose prose-slate prose-lg max-w-none font-inter
            prose-headings:font-barlow-condensed prose-headings:font-bold prose-headings:text-slate-900
            prose-a:text-atria-navy prose-a:underline prose-a:decoration-atria-navy/30 hover:prose-a:decoration-atria-navy
            prose-p:leading-relaxed prose-p:text-slate-600"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(post.conteudo) }}
        />

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-atria-navy to-slate-800 rounded-2xl p-8 text-center">
          <h3 className="font-barlow-condensed font-bold text-2xl text-white mb-2">
            Gostou? Venha conhecer nosso estoque
          </h3>
          <p className="text-white/70 font-inter text-sm mb-6">
            Mais de 200 veiculos seminovos em Campinas. Financiamento facilitado e garantia de procedencia.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={ROUTES.estoque}
              className="bg-gradient-to-b from-atria-yellow-light to-atria-yellow hover:brightness-105 text-atria-navy font-bold uppercase tracking-wider text-sm px-8 py-3 rounded-xl transition">
              Ver estoque completo
            </a>
            <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MSG)}`} target="_blank" rel="noopener noreferrer"
              className="border-2 border-white/30 hover:border-white text-white font-bold uppercase tracking-wider text-sm px-8 py-3 rounded-xl transition">
              Falar no WhatsApp
            </a>
          </div>
        </div>

        {/* Keywords */}
        {post.keywords.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.keywords.map((kw) => (
              <span key={kw} className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{kw}</span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
