import { useState } from 'react';
import {
  ArrowRight, Calendar, Clock, X, BookOpen,
  Tag, ChevronRight, Search
} from 'lucide-react';
import NewsletterSubscribe from '../components/NewsletterSubscribe';
import DOMPurify from 'dompurify';

import { type BlogPost } from '../data/blogPosts'; // mantém só o tipo
import { useBlogPosts } from '../hooks/useBlogPosts';

// ─── helpers ────────────────────────────────────────────────────────────────

const AUTHOR_AVATAR =
  'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=80';

// ─── sub-components ──────────────────────────────────────────────────────────

interface CategoryPillProps {
  label: string;
  active?: boolean;
  onClick: () => void;
}

function CategoryPill({ label, active, onClick }: CategoryPillProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
        active
          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
      }`}
    >
      {label}
    </button>
  );
}

// ─── modal ───────────────────────────────────────────────────────────────────

interface PostModalProps {
  post: BlogPost;
  onClose: () => void;
}

function PostModal({ post, onClose }: PostModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Hero image */}
        <div className="relative shrink-0">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-56 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 text-gray-700 hover:text-gray-900 transition-colors shadow"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-5">
            <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
              {post.category}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-7 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
            <img
              src={AUTHOR_AVATAR}
              alt={post.author}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{post.author}</p>
              <p className="text-xs text-gray-400">YMR Industrial Team</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400 shrink-0">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {post.readTime}
              </span>
            </div>
          </div>

          <div
            className="prose prose-gray prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-p:text-gray-600 prose-p:leading-relaxed
              prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-800
              prose-li:text-gray-600"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 bg-gray-50 px-7 py-4 flex items-center justify-between">
          <p className="text-xs text-gray-400">Thanks for reading · YMR Industrial</p>
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── featured card ────────────────────────────────────────────────────────────

interface FeaturedCardProps {
  post: BlogPost;
  onOpen: (post: BlogPost) => void;
  readMoreLabel: string;
}

function FeaturedCard({ post, onOpen, readMoreLabel }: FeaturedCardProps) {
  return (
    <article className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 grid grid-cols-1 lg:grid-cols-5">
      {/* Image */}
      <div className="lg:col-span-2 relative overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-64 lg:h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
        <span className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
          Featured
        </span>
      </div>

      {/* Content */}
      <div className="lg:col-span-3 flex flex-col justify-center p-8 lg:p-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
            {post.category}
          </span>
          <span className="text-gray-400 text-sm flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {post.readTime}
          </span>
        </div>

        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug mb-3 group-hover:text-indigo-700 transition-colors duration-200">
          {post.title}
        </h2>

        <p className="text-gray-500 leading-relaxed mb-6 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={AUTHOR_AVATAR}
              alt={post.author}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-100"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">{post.author}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {post.date}
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpen(post)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors duration-200"
          >
            {readMoreLabel} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── regular card ─────────────────────────────────────────────────────────────

interface PostCardProps {
  post: BlogPost;
  onOpen: (post: BlogPost) => void;
  readMoreLabel: string;
  index: number;
}

function PostCard({ post, onOpen, readMoreLabel, index }: PostCardProps) {
  return (
    <article
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
          {post.category}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {post.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {post.readTime}
          </span>
        </div>

        <h3 className="text-base font-bold text-gray-900 leading-snug mb-2 group-hover:text-indigo-700 transition-colors duration-200 line-clamp-2">
          {post.title}
        </h3>

        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4 flex-1">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <img
              src={AUTHOR_AVATAR}
              alt={post.author}
              className="w-7 h-7 rounded-full object-cover"
            />
            <span className="text-xs font-medium text-gray-700">{post.author}</span>
          </div>

          <button
            onClick={() => onOpen(post)}
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition-colors duration-200"
          >
            {readMoreLabel} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

const Blog = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showAllPosts, setShowAllPosts]   = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery]    = useState('');

  const { getFeaturedPost, getRegularPosts, loading } = useBlogPosts();
  const featuredPost = getFeaturedPost();
  const allRegular   = getRegularPosts();

  // Derive unique categories
  const categories = ['All', ...Array.from(new Set(allRegular.map((p) => p.category)))];

  // Filter
  const filtered = allRegular.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const displayed = showAllPosts ? filtered : filtered.slice(0, 6);

  const openModal  = (post: BlogPost) => setSelectedPost(post);
  const closeModal = ()               => setSelectedPost(null);

  return (
    <div className="min-h-screen page-content bg-gray-50">

      {/* ── Hero / Header ──────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          
          <div className="flex items-center justify-between">
            
            {/* Espaço vazio à esquerda para balancear */}
            <div className="w-1/3 hidden md:block" />

            {/* Título central */}
            <div className="w-full md:w-1/3 text-center">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Last News
              </h1>
            </div>

            {/* Search à direita */}
            <div className="w-full md:w-1/3 flex justify-end">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Pesquisar…"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowAllPosts(false);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 shadow-sm transition-all"
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          {/* Featured post — only when no search/filter active */}
          {featuredPost && activeCategory === 'All' && searchQuery === '' && (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Tag className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Featured</span>
              </div>
              <FeaturedCard
                post={featuredPost}
                onOpen={openModal}
                readMoreLabel="Read article"
              />
            </div>
          )}

          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <CategoryPill
                key={cat}
                label={cat}
                active={activeCategory === cat}
                onClick={() => { setActiveCategory(cat); setShowAllPosts(false); }}
              />
            ))}
          </div>


          {loading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
            </div>
          )}
          {/* Grid */}
          {displayed.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayed.map((post, i) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onOpen={openModal}
                    readMoreLabel="Read more"
                    index={i}
                  />
                ))}
              </div>

              {/* Load more */}
              {filtered.length > 6 && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setShowAllPosts((v) => !v)}
                    className="inline-flex items-center gap-2 border border-gray-300 hover:border-indigo-500 text-gray-700 hover:text-indigo-700 bg-white text-sm font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-sm"
                  >
                    {showAllPosts
                      ? 'Show less'
                      : `View all ${filtered.length} articles`}
                    <ArrowRight
                      className={`h-4 w-4 transition-transform duration-200 ${showAllPosts ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No articles found.</p>
              <p className="text-gray-400 text-sm mt-1">
                Try a different search term or category.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                className="mt-4 text-indigo-600 hover:underline text-sm font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Newsletter strip ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-12">
        <NewsletterSubscribe variant="inline" />
      </section>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {selectedPost && (
        <PostModal post={selectedPost} onClose={closeModal} />
      )}
    </div>
  );
};

export default Blog;