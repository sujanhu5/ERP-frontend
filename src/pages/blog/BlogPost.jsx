import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Clock, Calendar, Tag, ArrowLeft, ArrowRight, Heart } from 'lucide-react';
import { blogPublicService } from '../../services';
import ReadingProgress from '../../components/blog/ReadingProgress';
import TableOfContents from '../../components/blog/TableOfContents';
import ShareButtons from '../../components/blog/ShareButtons';
import BlogCard from '../../components/blog/BlogCard';
import Logo from '../../components/common/Logo';
import { resolveMediaUrl } from '../../utils/media';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    blogPublicService.post(slug)
      .then(({ data }) => {
        setPost(data.data);
        setRelated(data.data.related || []);
        setLikeCount(data.data.like_count || 0);
        document.title = `${data.data.title} · Maxmatrix Blog`;
      })
      .catch(() => navigate('/blog', { replace: true }))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleLike = async () => {
    try {
      const { data } = await blogPublicService.like(slug);
      setLiked(data.data.liked);
      setLikeCount((c) => c + (data.data.liked ? 1 : -1));
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1A]">
        <div className="max-w-3xl mx-auto px-5 py-24 space-y-5">
          <div className="skeleton h-10 rounded-lg" />
          <div className="skeleton h-6 rounded w-3/4" />
          <div className="skeleton h-64 rounded-xl" />
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-4 rounded" />)}
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-[#0A0F1A] text-white">
      <ReadingProgress />

      {/* Nav */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#0A0F1A]/80 border-b border-white/[0.07]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link to="/blog" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-[13px]">
            <ArrowLeft size={15} /> Blog
          </Link>
          <Link to="/"><Logo size="sm" onDark /></Link>
          <ShareButtons title={post.title} />
        </div>
      </nav>

      {/* Content layout */}
      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="flex gap-12 justify-center">
          {/* Article */}
          <article className="flex-1 min-w-0 max-w-[740px]">
            {/* Meta */}
            <div className="mb-6">
              {post.category_name && (
                <span
                  className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide mb-4"
                  style={{ background: `${post.category_color || '#D62828'}20`, color: post.category_color || '#EB4C4C', border: `1px solid ${post.category_color || '#D62828'}40` }}
                >
                  {post.category_name}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-snug mb-5">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-white/60 text-[18px] leading-relaxed mb-6">{post.excerpt}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-white/40 text-[13px] pb-6 border-b border-white/[0.08]">
                {post.author_name && (
                  <span className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
                      {post.author_name[0]}
                    </div>
                    {post.author_name}
                  </span>
                )}
                <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(post.published_at)}</span>
                <span className="flex items-center gap-1"><Clock size={12} />{post.reading_time_minutes} min read</span>
                {post.tags?.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {post.tags.map((t) => (
                      <Link key={t.id} to={`/tag/${t.slug}`}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.05] text-white/40 hover:text-white/70 text-[11px] transition-colors">
                        <Tag size={9} />{t.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Featured image */}
            {post.featured_image && (
              <div className="rounded-xl overflow-hidden mb-8 aspect-video bg-[#0E1B2C]">
                <img src={resolveMediaUrl(post.featured_image)} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Body */}
            <div
              className="blog-prose"
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
            />

            {/* Like + Share */}
            <div className="mt-12 pt-8 border-t border-white/[0.08] flex items-center justify-between flex-wrap gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-[13px]
                  ${liked ? 'bg-danger/20 border-danger/40 text-danger' : 'bg-white/[0.05] border-white/[0.1] text-white/60 hover:border-white/30 hover:text-white'}`}
              >
                <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
                {likeCount} {likeCount === 1 ? 'like' : 'likes'}
              </button>
              <ShareButtons title={post.title} />
            </div>

            {/* Author card */}
            {post.author_name && (
              <div className="mt-10 p-6 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg font-bold shrink-0">
                    {post.author_name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{post.author_name}</p>
                    <p className="text-[13px] text-white/50">Maxmatrix Team</p>
                  </div>
                </div>
              </div>
            )}

            {/* Related posts */}
            {related.length > 0 && (
              <div className="mt-16">
                <h2 className="text-[18px] font-bold mb-6 text-white">Related Posts</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  {related.slice(0, 4).map((p) => <BlogCard key={p.id} post={p} />)}
                </div>
              </div>
            )}

            {/* Prev / Next nav placeholder */}
            <div className="mt-12 pt-8 border-t border-white/[0.08] flex justify-between">
              <Link to="/blog" className="flex items-center gap-2 text-[13px] text-white/40 hover:text-white transition-colors">
                <ArrowLeft size={15} /> Back to Blog
              </Link>
            </div>
          </article>

          {/* TOC sidebar */}
          <TableOfContents content={post.content} />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] mt-20 py-8 text-center text-white/30 text-[12px]">
        <p>© {new Date().getFullYear()} Maxmatrix · <Link to="/" className="hover:text-white/60">Home</Link> · <Link to="/blog" className="hover:text-white/60">Blog</Link></p>
      </footer>
    </div>
  );
}
