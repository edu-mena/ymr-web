// src/components/AdSlider/index.tsx
import React from "react";
import { Link } from "react-router-dom";
import { blogPosts } from "../../data/BlogPosts";
import { useAutoSlide } from "../../hooks/useAutoSlide";

type Props = { delay?: number; height?: string };

export default function AdSlider({ delay = 4000, height = "h-48" }: Props) {
  // Garantir pelo menos 3 posts
  const posts = blogPosts.slice(0, Math.max(3, blogPosts.length));

  const { index, next, prev, pause, resume } = useAutoSlide(
    posts.length,
    delay,
    false
  );

  return (
    <div
      className={`relative ${height} w-full`}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {posts.map((post, i) => (
        <article
          key={post.id}
          className={`absolute inset-0 p-4 transition-opacity duration-500 ${
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="rounded-lg h-full flex items-stretch overflow-hidden shadow-lg bg-white dark:bg-gray-800">
            
            {/* Imagem */}
            <div className="w-1/3 bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center">
              <img
                src={post.image}
                alt={post.title}
                className="object-cover w-full h-full"
              />
            </div>

            {/* Conteúdo */}
            <div className="flex-1 p-5 text-gray-900 dark:text-gray-100 flex flex-col justify-between">
              <div>
                <span className="inline-block text-xs bg-indigo-600 text-white px-2 py-1 rounded mb-2">
                  {post.category}
                </span>

                <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                  {post.title}
                </h4>

                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-4">
                <Link
                  to="/About#blog"
                  className="inline-block bg-red-600 hover:bg-red-700 transition-colors text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Ver mais
                </Link>
              </div>
            </div>
          </div>
        </article>
      ))}

      {/* Navegação */}
      <div className="absolute right-3 bottom-3 flex gap-2">
        <button
          onClick={() => prev()}
          className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
        >
          ◀
        </button>
        <button
          onClick={() => next()}
          className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
        >
          ▶
        </button>
      </div>
    </div>
  );
}