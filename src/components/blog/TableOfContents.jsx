import { useEffect, useState } from 'react';
import { List } from 'lucide-react';

export default function TableOfContents({ content }) {
  const [headings, setHeadings] = useState([]);
  const [active, setActive] = useState('');

  useEffect(() => {
    // Parse headings from rendered DOM
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

  return (
    <div className="hidden xl:block sticky top-24 w-56 shrink-0">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-1.5">
        <List size={12} />Contents
      </p>
      <nav className="space-y-1">
        {headings.map(({ id, text, level }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }}
            className={`block text-[12px] leading-snug py-1 transition-colors truncate
              ${level === 1 ? '' : level === 2 ? 'pl-3' : 'pl-6'}
              ${active === id ? 'text-primary font-medium' : 'text-white/40 hover:text-white/70'}`}
          >
            {text}
          </a>
        ))}
      </nav>
    </div>
  );
}
