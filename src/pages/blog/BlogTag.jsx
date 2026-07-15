import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Tag } from 'lucide-react';
import { blogPublicService } from '../../services';
import BlogCard from '../../components/blog/BlogCard';
import Logo from '../../components/common/Logo';

export default function BlogTag() {
  const { tag } = useParams();
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    setLoading(true);
    blogPublicService.posts({ tag, limit: 20 })
      .then(({ data }) => { setPosts(data.data); setTotal(data.pagination.total); })
      .finally(() => setLoading(false));
  }, [tag]);

  return (
    <div className="min-h-screen bg-[#0A0F1A] text-white">
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#0A0F1A]/80 border-b border-white/[0.07]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center gap-4">
          <Link to="/blog" className="flex items-center gap-2 text-white/60 hover:text-white text-[13px]"><ArrowLeft size={15} />Blog</Link>
          <div className="ml-auto"><Link to="/"><Logo size="sm" onDark /></Link></div>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Tag size={13} className="text-primary" />
            <span className="text-[12px] font-medium text-primary">Tag</span>
          </div>
          <h1 className="text-3xl font-bold">#{tag}</h1>
          <p className="text-white/40 text-[14px] mt-1">{total} post{total !== 1 ? 's' : ''}</p>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-56 rounded-xl" />)}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-white/40 text-center py-16">No posts with this tag yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => <BlogCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
