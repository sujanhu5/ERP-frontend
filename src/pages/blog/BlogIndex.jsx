import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Rss, ArrowRight } from 'lucide-react';
import { blogPublicService } from '../../services';
import BlogCard from '../../components/blog/BlogCard';
import Logo from '../../components/common/Logo';

export default function BlogIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const category = searchParams.get('category') || '';
  const LIMIT = 9;

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    blogPublicService.categories().then(({ data }) => setCategories(data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    blogPublicService.posts({ page, limit: LIMIT, search: search || undefined, category: category || undefined })
      .then(({ data }) => { setPosts(data.data); setTotal(data.pagination.total); })
      .finally(() => setLoading(false));
  }, [page, search, category]);

  const featuredPost = posts.find((p) => p.is_featured) || posts[0];
  const rest = posts.filter((p) => p.id !== featuredPost?.id);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    const s = new URLSearchParams(searchParams);
    if (search) s.set('q', search); else s.delete('q');
    setSearchParams(s);
  };

  const setCategory = (slug) => {
    setPage(1);
    const s = new URLSearchParams();
    if (slug) s.set('category', slug);
    setSearchParams(s);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1A] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#0A0F1A]/80 border-b border-white/[0.07]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <Link to="/"><Logo size="sm" onDark /></Link>
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                className="bg-white/[0.06] border border-white/[0.1] rounded-lg pl-8 pr-3 py-1.5 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-primary w-48"
                placeholder="Search posts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            <Link to="/login" className="text-[13px] text-white/60 hover:text-white transition-colors">Sign in</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-5 pt-14 pb-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5">
            <Rss size={13} className="text-primary" />
            <span className="text-[12px] font-medium text-primary">Maxmatrix Blog</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Insights for <span className="text-primary">Modern Business</span>
          </h1>
          <p className="text-white/50 text-[17px] max-w-lg mx-auto">
            ERP tips, business insights, product updates and more.
          </p>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            <button
              onClick={() => setCategory('')}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all border
                ${!category
                  ? 'bg-primary/20 border-primary/40 text-primary'
                  : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white hover:border-white/20'}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.slug)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all border
                  ${category === c.slug
                    ? 'text-white border-transparent'
                    : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white hover:border-white/20'}`}
                style={category === c.slug ? { background: `${c.color}30`, borderColor: `${c.color}60`, color: c.color } : {}}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Featured post */}
        {!loading && featuredPost && !search && !category && (
          <div className="mb-12">
            <BlogCard post={featuredPost} featured />
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white/[0.04] overflow-hidden">
                <div className="skeleton h-48" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-4 rounded w-3/4" />
                  <div className="skeleton h-3 rounded" />
                  <div className="skeleton h-3 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : rest.length === 0 && !featuredPost ? (
          <div className="text-center py-20 text-white/40">
            <Search size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-[15px]">No posts found.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(search || category ? posts : rest).map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex justify-center gap-2 mt-12">
            {page > 1 && (
              <button onClick={() => setPage((p) => p - 1)} className="px-5 py-2 rounded-lg border border-white/[0.1] text-[13px] text-white/60 hover:text-white hover:border-white/30 transition-all">
                Previous
              </button>
            )}
            {page * LIMIT < total && (
              <button onClick={() => setPage((p) => p + 1)} className="px-5 py-2 rounded-lg bg-primary/10 border border-primary/30 text-[13px] text-primary hover:bg-primary/20 transition-all flex items-center gap-2">
                Load more <ArrowRight size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] mt-20 py-8 text-center text-white/30 text-[12px]">
        <p>© {new Date().getFullYear()} Maxmatrix · <Link to="/" className="hover:text-white/60">Home</Link> · <Link to="/login" className="hover:text-white/60">Sign in</Link></p>
      </footer>
    </div>
  );
}
