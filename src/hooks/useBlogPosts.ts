import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  featured?: boolean;
}

export function useBlogPosts() {
  const [posts, setPosts]     = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/blog')
      .then(data => setPosts(data.data))
      .catch(err => console.error('useBlogPosts:', err))
      .finally(() => setLoading(false));
  }, []);

  const getFeaturedPost  = () => posts.find(p => p.featured) ?? null;
  const getRegularPosts  = () => posts.filter(p => !p.featured);

  return { posts, loading, getFeaturedPost, getRegularPosts };
}