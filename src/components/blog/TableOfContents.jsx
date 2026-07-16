import { useEffect, useState } from 'react';
import { List, X, ChevronRight } from 'lucide-react';

export default function TableOfContents({ content }) {
  const [headings, setHeadings] = useState([]);
  const [active, setActive]     = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const article = document.querySelector('.blog-prose');
    if (!article) return;
    const els = article.querySelectorAll('h1, h2, h3');
    const items = [];
    els.forEach((el, i) => {
      const id = `toc-${i}`;
      el.id = id;
      items.push({ id, text: el.textContent, level: parseInt(el.tagName[1], 10) });
    });
    setHeadings(items);
  }, [content]);

  useEffect(() => {
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: '-10% 0px -80% 0px' }
    );
    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  };

  const TocLink = ({ id, text, level }) => (
    <button
      onClick={() => scrollTo(id)}
      className={`w-full text-left text-[12px] leading-snug py-1.5 transition-colors truncate flex items-center gap-1.5
        ${level === 1 ? '' : level === 2 ? 'pl-3' : 'pl-6'}
        ${active === id
          ? 'text-primary font-medium'
          : 'text-white/40 hover:text-white/80'}`}
    >
      {active === id && <ChevronRight size={10} className="shrink-0 text-primary" />}
      <span className="truncate">{text}</span>
    </button>
  );

  return (
    <>
      {/* ── Desktop sidebar TOC (xl+) ── */}
      <div className="hidden xl:block sticky top-24 w-56 shrink-0 self-start">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-1.5">
          <List size={12} /> Contents
        </p>
        <nav className="space-y-0.5">
          {headings.map((h) => <TocLink key={h.id} {...h} />)}
        </nav>
      </div>

      {/* ── Mobile floating TOC button ── */}
      <div className="xl:hidden fixed bottom-6 right-4 z-40">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary shadow-lg shadow-primary/30 text-white text-[13px] font-medium"
        >
          <List size={15} />
          Contents
        </button>
      </div>

      {/* ── Mobile TOC sheet ── */}
      {mobileOpen && (
        <div className="xl:hidden fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />

          {/* Sheet */}
          <div className="relative w-full bg-[#0E1B2C] border-t border-white/[0.08] rounded-t-2xl max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] shrink-0">
              <p className="text-[13px] font-semibold text-white flex items-center gap-2">
                <List size={14} className="text-primary" /> Contents
              </p>
              <button onClick={() => setMobileOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <nav className="overflow-y-auto px-4 py-3 space-y-0.5">
              {headings.map((h) => <TocLink key={h.id} {...h} />)}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
