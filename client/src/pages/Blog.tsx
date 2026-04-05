import { useState, useEffect } from "react";
import { BookOpen, Calendar } from "lucide-react";
import { getPublishedBlogPosts, type BlogPost } from "@/lib/adminFirestore";
import { useSEO } from "@/hooks/useSEO";
import { ROUTES, SITE_URL } from "@/lib/constants";

const CATEGORIA_LABELS: Record<string, string> = {
  comparativo: "Comparativo",
  "guia-preco": "Guia de Preco",
  review: "Review",
  financiamento: "Financiamento",
  "guia-perfil": "Guia",
};

function fmtDate(ts: { toDate?: () => Date } | null) {
  if (!ts || !ts.toDate) return "";
  return ts.toDate().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function excerpt(html: string, maxLen = 200): string {
  const text = html.replace(/[#*_\[\]()>`-]/g, "").replace(/\n+/g, " ").trim();
  return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "Blog | Atria Veiculos — Dicas de Carros Usados e Seminovos em Campinas SP",
    description: "Dicas, comparativos e guias para comprar carros usados e seminovos em Campinas SP. Atria Veiculos, ha mais de 13 anos no mercado.",
    path: ROUTES.blog,
  });

  useEffect(() => {
    getPublishedBlogPosts().then(setPosts).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Schema ItemList
  useEffect(() => {
    if (!posts.length) return;
    const old = document.getElementById("schema-blog-list");
    if (old) old.remove();
    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Blog Atria Veiculos",
      "itemListElement": posts.map((p, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "url": `${SITE_URL}/blog/${p.slug}`,
        "name": p.titulo,
      })),
    };
    const s = document.createElement("script");
    s.id = "schema-blog-list"; s.type = "application/ld+json";
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
    return () => { document.getElementById("schema-blog-list")?.remove(); };
  }, [posts]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-atria-navy via-atria-navy to-slate-800 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-barlow-condensed font-black text-4xl md:text-5xl text-white mb-3">Blog</h1>
          <p className="font-inter text-white/70 text-lg max-w-2xl mx-auto">
            Dicas, comparativos e guias para voce escolher o seminovo ideal em Campinas
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-atria-navy animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-semibold text-slate-700">Nenhum artigo publicado ainda</h2>
            <p className="text-slate-500 mt-1">Em breve teremos conteudo por aqui.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <a key={post.slug} href={`/blog/${post.slug}`}
                className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium bg-atria-navy/10 text-atria-navy px-2.5 py-1 rounded-full">
                      {CATEGORIA_LABELS[post.categoria] || post.categoria}
                    </span>
                    {post.data_publicacao && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={12} /> {fmtDate(post.data_publicacao)}
                      </span>
                    )}
                  </div>
                  <h2 className="font-barlow-condensed font-bold text-xl text-slate-900 group-hover:text-atria-navy transition-colors mb-2">
                    {post.titulo}
                  </h2>
                  <p className="font-inter text-slate-500 text-sm leading-relaxed">
                    {excerpt(post.conteudo)}
                  </p>
                  <span className="inline-block mt-4 text-sm font-medium text-atria-navy group-hover:underline">
                    Ler artigo completo →
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
