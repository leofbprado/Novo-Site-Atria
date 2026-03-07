import { useState, useEffect } from "react";

// ── Place IDs das 3 lojas Atria Veiculos em Campinas ─────────────────────────
const PLACES = [
  { id: "ChIJHfOghtjOyJQRdL4Zsnxwsis", loja: "Abolição" },
  { id: "ChIJL6nIwhrGyJQRVjPLf7OBAsU", loja: "Guanabara" },
  { id: "ChIJ1yAZp0TJyJQR_81hXZHa3j8", loja: "Campos Elíseos" },
] as const;

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

// ── Fetch reviews from Google Places API (New) ──────────────────────────────
async function fetchPlaceReviews(
  placeId: string,
  loja: string,
  apiKey: string
): Promise<GoogleReview[]> {
  const url = `https://places.googleapis.com/v1/places/${placeId}?fields=reviews,rating,userRatingCount&key=${apiKey}`;
  const res = await fetch(url, {
    headers: { "X-Goog-FieldMask": "reviews,rating,userRatingCount" },
  });
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.reviews) return [];

  return data.reviews.map((r: any) => ({
    authorName: r.authorAttribution?.displayName || "Cliente",
    authorPhoto: r.authorAttribution?.photoUri || "",
    rating: r.rating ?? 0,
    text: r.text?.text || r.originalText?.text || "",
    relativeTime: r.relativePublishTimeDescription || "",
    publishTime: r.publishTime || "",
    loja,
  }));
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useGoogleReviews() {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [averageRating, setAverageRating] = useState(4.8);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isReal, setIsReal] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

    // Check cache first
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

    // No valid cache — try API
    if (!apiKey) {
      setReviews(FALLBACK_REVIEWS);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        // Fetch all 3 stores in parallel
        const results = await Promise.all(
          PLACES.map((p) => fetchPlaceReviews(p.id, p.loja, apiKey))
        );

        const allReviews = results.flat();
        if (allReviews.length === 0) {
          setReviews(FALLBACK_REVIEWS);
          setLoading(false);
          return;
        }

        // Filter only 5-star reviews
        const fiveStars = allReviews.filter((r) => r.rating === 5);

        // Sort by publishTime (most recent first)
        fiveStars.sort((a, b) => {
          if (a.publishTime && b.publishTime) {
            return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime();
          }
          return 0;
        });

        // Pick up to 6 reviews, trying to get 2 from each store
        const selected: GoogleReview[] = [];
        const byStore = new Map<string, GoogleReview[]>();
        for (const r of fiveStars) {
          if (!byStore.has(r.loja)) byStore.set(r.loja, []);
          byStore.get(r.loja)!.push(r);
        }
        // First pass: 2 from each store
        for (const [, storeReviews] of byStore) {
          selected.push(...storeReviews.slice(0, 2));
        }
        // If less than 6, fill from remaining
        if (selected.length < 6) {
          for (const r of fiveStars) {
            if (selected.length >= 6) break;
            if (!selected.includes(r)) selected.push(r);
          }
        }
        // Trim to 6
        const final = selected.slice(0, 6);

        // Calculate average from ALL reviews (not just 5-star)
        const avgRating =
          allReviews.length > 0
            ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
            : 4.8;

        // Also fetch total count from API responses
        const totalCount = allReviews.length;

        // Cache
        const cacheData: CachedData = {
          ts: Date.now(),
          reviews: final,
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: totalCount,
        };
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch {}

        setReviews(final);
        setAverageRating(cacheData.averageRating);
        setTotalReviews(totalCount);
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
