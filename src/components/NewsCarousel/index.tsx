// src/components/NewsCarousel/index.tsx
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import type { NewsSlide } from "../../types";
import { useAutoSlide } from "../../hooks/useAutoSlide";
import { useBlogPosts } from "../../hooks/useBlogPosts";

type Props = { slides?: NewsSlide[]; delay?: number; height?: string };

export default function NewsCarousel({ slides, delay = 6000, height = "h-[20rem]" }: Props) {
  // Se slides foi fornecido explicitamente, usa-os; senão, vai ao backend
  const { posts: apiPosts, loading } = useBlogPosts();
  const useBackend = slides === undefined;

  const newsData: NewsSlide[] = slides || apiPosts.slice(0, 4).map(post => ({
    id: post.id,
    title: post.title,
    summary: post.excerpt,
    image: post.image,
    category: post.category,
    date: post.date,
    link: `/about#blog-${post.id}`
  }));

  // ✅ Hooks must be called unconditionally, before any early returns
  const { index, pause, resume, goTo } = useAutoSlide(newsData.length || 1, delay, false);

  if (useBackend && loading) {
    return (
      <div className={`relative ${height} w-full bg-[#e6e6e6] rounded-xl flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (newsData.length === 0) return null;

  return (
    <div
      className={`relative ${height} w-full bg-[#e6e6e6] rounded-xl`}
      onMouseEnter={pause}
      onMouseLeave={resume}
      aria-live="polite"
    >
      {newsData.map((n, i) => (
        <article
          key={n.id}
          className={`absolute inset-0 p-5 transition-opacity duration-500 ${
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <img
            src={n.image}
            alt={n.title}
            className="w-full h-32 object-cover rounded-lg mb-3"
            loading="lazy"
          />
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
            {n.category}
          </span>
          <h4 className="font-semibold text-sm mb-2 line-clamp-1 text-gray-900">{n.title}</h4>
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{n.summary}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{n.date}</span>
            <Link
              to={n.link}
              className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
            >
              Read more <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </article>
      ))}

      {/* Dots fixados no bottom */}
      <div className="absolute bottom-4 w-full flex justify-center gap-2 z-20">
        {newsData.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2 h-2 rounded-full cursor-pointer ${
              i === index ? "bg-blue-500" : "bg-gray-300"
            }`}
            aria-label={`Ir para slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
