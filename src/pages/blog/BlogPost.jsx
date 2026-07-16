import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Clock, Calendar, Tag, ArrowLeft, Heart, Send, MessageCircle } from 'lucide-react';
import { blogPublicService } from '../../services';
import ReadingProgress from '../../components/blog/ReadingProgress';
import TableOfContents from '../../components/blog/TableOfContents';
import ShareButtons from '../../components/blog/ShareButtons';
import BlogCard from '../../components/blog/BlogCard';
import Logo from '../../components/common/Logo';
import { resolveMediaUrl } from '../../utils/media';

const INSTA_URL = 'https://www.instagram.com/maxmatrix.in?igsh=MWVpNXptb2prajhhOA==';

function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatCommentDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function CommentsSection({ slug }) {
  const [comments, setComments] = useState([]);
  const [name, setName]         = useState('');
  const [text, setText]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    blogPublicService.comments(slug)
      .then(({ data }) => setComments(data.data))
      .catch(() => {});
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!text.trim()) { setError('Please write a comment.'); return; }
    setSubmitting(true);
    try {
      const { data } = await blogPublicService.addComment(slug, { name: name.trim(), content: text.trim() });
      setComments((prev) => [...prev, data.data]);
      setName('');
      setText('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16">
      <h2 className="text-[20px] font-bold text-white mb-6 flex items-center gap-2">
        <MessageCircle size={20} className="text-primary" />
        {comments.length > 0 ? `${comments.length} Comment${comments.length !== 1 ? 's' : ''}` : 'Comments'}
      </h2>

      {/* Comment list */}
      {comments.length > 0 && (
        <div className="space-y-4 mb-10">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-4">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[13px] font-bold shrink-0 mt-0.5">
                {c.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[13px] font-semibold text-white">{c.name}</span>
                  <span className="text-[11px] text-white/30">{formatCommentDate(c.created_at)}</span>
                </div>
                <p className="text-[13px] text-white/70 leading-relaxed whitespace-pre-wrap">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {comments.length === 0 && (
        <p className="text-white/30 text-[13px] mb-8">Be the first to leave a comment!</p>
      )}

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 space-y-4">
        <p className="text-[13px] font-semibold text-white/70">Leave a comment</p>

        <input
          type="text"
          placeholder="Your name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-2.5 text-[13px] text-white placeholder:text-white/30 outline-none focus:border-primary/50 transition-colors"
        />

        <textarea
          placeholder="Write your comment…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={2000}
          className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-2.5 text-[13px] text-white placeholder:text-white/30 outline-none focus:border-primary/50 transition-colors resize-none"
        />

        {error && <p className="text-red-400 text-[12px]">{error}</p>}
        {submitted && <p className="text-green-400 text-[12px]">Comment posted!</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-[13px] font-medium transition-colors disabled:opacity-50"
        >
          <Send size={13} />
          {submitting ? 'Posting…' : 'Post Comment'}
        </button>
      </form>
    </div>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost]       = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked]     = useState(false);
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
        <div className="max-w-6xl mx-auto px-4 sm:px-5 h-14 flex items-center justify-between gap-3">
          <Link to="/blog" className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-[13px] shrink-0">
            <ArrowLeft size={15} /> <span className="hidden sm:inline">Blog</span>
          </Link>
          <Link to="/"><Logo size="sm" onDark /></Link>
          <ShareButtons title={post.title} />
        </div>
      </nav>

      {/* Content layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-6 sm:py-10 pb-24 sm:pb-10">
        <div className="flex gap-12 justify-center">

          {/* Article */}
          <article className="flex-1 min-w-0 max-w-[740px]">

            {/* Meta */}
            <div className="mb-5">
              {post.category_name && (
                <span
                  className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide mb-3"
                  style={{ background: `${post.category_color || '#D62828'}20`, color: post.category_color || '#EB4C4C', border: `1px solid ${post.category_color || '#D62828'}40` }}
                >
                  {post.category_name}
                </span>
              )}
              <h1 className="text-[26px] sm:text-4xl font-bold tracking-tight leading-tight mb-4">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-white/60 text-[15px] sm:text-[18px] leading-relaxed mb-5">{post.excerpt}</p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/40 text-[12px] sm:text-[13px] pb-5 border-b border-white/[0.08]">
                {post.author_name && (
                  <span className="flex items-center gap-1.5">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[9px] sm:text-[10px] font-bold">
                      {post.author_name[0]}
                    </div>
                    {post.author_name}
                  </span>
                )}
                <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(post.published_at)}</span>
                <span className="flex items-center gap-1"><Clock size={11} />{post.reading_time_minutes} min read</span>
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

            {/* Featured image — edge-to-edge on mobile */}
            {post.featured_image && (
              <div className="-mx-4 sm:mx-0 sm:rounded-xl overflow-hidden mb-7 aspect-video bg-[#0E1B2C]">
                <img src={resolveMediaUrl(post.featured_image)} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Body */}
            <div
              className="blog-prose"
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
            />

            {/* Like + Share */}
            <div className="mt-10 pt-6 border-t border-white/[0.08] flex items-center justify-between flex-wrap gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-[13px]
                  ${liked ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/[0.05] border-white/[0.1] text-white/60 hover:border-white/30 hover:text-white'}`}
              >
                <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
                {likeCount} {likeCount === 1 ? 'like' : 'likes'}
              </button>
              <ShareButtons title={post.title} />
            </div>

            {/* Author card */}
            {post.author_name && (
              <div className="mt-8 p-5 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-base sm:text-lg font-bold shrink-0">
                    {post.author_name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-[14px]">{post.author_name}</p>
                    <p className="text-[12px] text-white/50">Maxmatrix Team</p>
                  </div>
                </div>
              </div>
            )}

            {/* Comments */}
            <CommentsSection slug={slug} />

            {/* Instagram follow banner */}
            <a
              href={INSTA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-orange-900/30 border border-pink-500/20 hover:border-pink-500/40 transition-all group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <InstagramIcon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] sm:text-[14px] font-semibold text-white">Follow us on Instagram</p>
                <p className="text-[11px] sm:text-[12px] text-white/50 mt-0.5">@maxmatrix.in · Updates, tips &amp; behind the scenes</p>
              </div>
              <span className="text-[12px] text-pink-400 font-medium shrink-0 group-hover:underline hidden sm:inline">Follow →</span>
            </a>

            {/* Related posts */}
            {related.length > 0 && (
              <div className="mt-14">
                <h2 className="text-[17px] sm:text-[18px] font-bold mb-5 text-white">Related Posts</h2>
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                  {related.slice(0, 4).map((p) => <BlogCard key={p.id} post={p} />)}
                </div>
              </div>
            )}

            {/* Back nav */}
            <div className="mt-10 pt-6 border-t border-white/[0.08]">
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
      <footer className="border-t border-white/[0.06] mt-16 sm:mt-20 py-8 text-center text-white/30 text-[12px]">
        <div className="flex items-center justify-center gap-4 mb-3">
          <a href={INSTA_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-white/30 hover:text-pink-400 transition-colors">
            <InstagramIcon size={13} /> maxmatrix.in
          </a>
        </div>
        <p>© {new Date().getFullYear()} Maxmatrix · <Link to="/" className="hover:text-white/60">Home</Link> · <Link to="/blog" className="hover:text-white/60">Blog</Link></p>
      </footer>
    </div>
  );
}
