import { useState, useEffect } from "react";

const CACHE_KEY = "atria_google_reviews";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

// ── Types ────────────────────────────────────────────────────────────────────
export interface GoogleReview {
  authorName: string;
  authorPhoto: string;
  rating: number;
  text: string;
  relativeTime: string;
  publishTime: string;
  loja: string;
}

interface CachedData {
  ts: number;
  reviews: GoogleReview[];
  averageRating: number;
  totalReviews: number;
}

// ── Fallback reviews (usadas quando API nao esta configurada) ────────────────
const FALLBACK_REVIEWS: GoogleReview[] = [
  {
    authorName: "Carlos Mendonça",
    authorPhoto: "",
    rating: 5,
    text: "Comprei meu BMW X5 na Átria e a experiência foi incrível. Transparência total, sem surpresas. Recomendo demais!",
    relativeTime: "2 meses atrás",
    publishTime: "",
    loja: "Abolição",
  },
  {
    authorName: "Ana Paula Ribeiro",
    authorPhoto: "",
    rating: 5,
    text: "Processo de financiamento super ágil. Em 3 dias estava com o carro. Equipe muito atenciosa e profissional.",
    relativeTime: "1 mês atrás",
    publishTime: "",
    loja: "Guanabara",
  },
  {
    authorName: "Roberto Alves",
    authorPhoto: "",
    rating: 5,
    text: "Já é minha segunda compra na Átria. Voltei porque confio no trabalho deles. Preço justo e qualidade garantida.",
    relativeTime: "3 semanas atrás",
    publishTime: "",
    loja: "Campos Elíseos",
  },
];

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useGoogleReviews() {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [averageRating, setAverageRating] = useState(4.8);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isReal, setIsReal] = useState(false);

  useEffect(() => {
    // Check localStorage cache first
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached: CachedData = JSON.parse(raw);
        if (Date.now() - cached.ts < CACHE_TTL && cached.reviews.length > 0) {
          setReviews(cached.reviews);
          setAverageRating(cached.averageRating);
          setTotalReviews(cached.totalReviews);
          setIsReal(true);
          setLoading(false);
          return;
        }
      }
    } catch {}

    // Fetch from server proxy
    (async () => {
      try {
        const res = await fetch("/api/google-reviews");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();

        if (!data.reviews || data.reviews.length === 0) {
          setReviews(FALLBACK_REVIEWS);
          setLoading(false);
          return;
        }

        // Cache in localStorage
        const cacheData: CachedData = {
          ts: Date.now(),
          reviews: data.reviews,
          averageRating: data.averageRating,
          totalReviews: data.totalReviews,
        };
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch {}

        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
        setIsReal(true);
        setLoading(false);
      } catch {
        setReviews(FALLBACK_REVIEWS);
        setLoading(false);
      }
    })();
  }, []);

  return { reviews, averageRating, totalReviews, loading, isReal };
}
