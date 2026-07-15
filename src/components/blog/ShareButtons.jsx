import { useState } from 'react';
import { Twitter, Linkedin, Link2, Check } from 'lucide-react';

export default function ShareButtons({ title, url }) {
  const [copied, setCopied] = useState(false);
  const full = url || window.location.href;
  const encoded = encodeURIComponent(full);
  const encodedTitle = encodeURIComponent(title || '');

  const copy = () => {
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] text-white/40 mr-1">Share:</span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/60 hover:text-white transition-all"
        title="Share on Twitter"
      >
        <Twitter size={14} />
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encoded}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/60 hover:text-white transition-all"
        title="Share on LinkedIn"
      >
        <Linkedin size={14} />
      </a>
      <button
        onClick={copy}
        className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/60 hover:text-white transition-all"
        title="Copy link"
      >
        {copied ? <Check size={14} className="text-success" /> : <Link2 size={14} />}
      </button>
    </div>
  );
}
