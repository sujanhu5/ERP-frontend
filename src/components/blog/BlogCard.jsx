import { Link } from 'react-router-dom';
import { Clock, Tag, Calendar } from 'lucide-react';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BlogCard({ post, featured = false }) {
  const href = `/blog/${post.slug}`;

  if (featured) {
    return (
      <Link to={href} className="group block">
        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-[#0E1B2C]">
          {post.featured_image
            ? <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e]" />
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            {post.category_name && (
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide mb-3"
                style={{ background: `${post.category_color || '#D62828'}22`, color: post.category_color || '#D62828', border: `1px solid ${post.category_color || '#D62828'}44` }}>
                {post.category_name}
              </span>
            )}
            <h2 className="text-white text-2xl sm:text-3xl font-bold tracking-tight leading-snug mb-3 group-hover:text-primary-pale transition-colors">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-white/70 text-[15px] leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
            )}
            <div className="flex items-center gap-4 text-white/50 text-[12px]">
              {post.author_name && <span>{post.author_name}</span>}
              <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(post.published_at)}</span>
              <span className="flex items-center gap-1"><Clock size={11} />{post.reading_time_minutes} min</span>
            </div>
          </div>
          {post.is_featured && (
            <div className="absolute top-4 left-4 px-2.5 py-1 bg-primary/90 rounded-full text-[11px] font-semibold text-white">
              Featured
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link to={href} className="group block">
      <div className="rounded-xl overflow-hidden border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 h-full flex flex-col">
        {post.featured_image && (
          <div className="aspect-video overflow-hidden bg-[#0E1B2C] shrink-0">
            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3">
            {post.category_name && (
              <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{ color: post.category_color || '#EB4C4C', background: `${post.category_color || '#EB4C4C'}18` }}>
                {post.category_name}
              </span>
            )}
            <span className="text-white/30 text-[11px] flex items-center gap-1 ml-auto"><Clock size={10} />{post.reading_time_minutes} min</span>
          </div>

          <h3 className="text-white font-semibold text-[15px] leading-snug mb-2 group-hover:text-primary-pale transition-colors line-clamp-2">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-white/50 text-[13px] leading-relaxed line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
          )}

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.07]">
            <span className="text-white/40 text-[11px]">{formatDate(post.published_at)}</span>
            {post.tags?.length > 0 && (
              <div className="flex gap-1">
                {post.tags.slice(0, 2).map((t) => (
                  <span key={t.id} className="text-[10px] text-white/40 flex items-center gap-0.5">
                    <Tag size={9} />{t.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
