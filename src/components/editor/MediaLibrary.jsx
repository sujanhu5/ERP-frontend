import { useState, useEffect, useCallback } from 'react';
import { Upload, Search, Trash2, X, FolderOpen, Copy, Check } from 'lucide-react';
import { blogAdminService } from '../../services';
import toast from 'react-hot-toast';

export default function MediaLibrary({ onSelect, onClose }) {
  const [images, setImages] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await blogAdminService.images({ page, limit: 24, search: search || undefined });
      setImages(data.data);
      setTotal(data.pagination.total);
    } catch {
      toast.error('Failed to load images.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      await blogAdminService.uploadImage(fd);
      toast.success('Uploaded!');
      setPage(1);
      load();
    } catch {
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await blogAdminService.deleteImage(id);
      toast.success('Deleted.');
      load();
    } catch {
      toast.error('Delete failed.');
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-overlay border border-line w-full max-w-4xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
          <h2 className="text-[15px] font-semibold text-ink flex items-center gap-2"><FolderOpen size={17} />Media Library</h2>
          <div className="flex items-center gap-2">
            <label className="btn-primary !text-xs cursor-pointer">
              <input type="file" accept="image/*,image/webp" className="hidden" onChange={handleUpload} disabled={uploading} />
              <Upload size={14} /> {uploading ? 'Uploading…' : 'Upload'}
            </label>
            <button type="button" onClick={onClose} className="btn-ghost !p-1.5"><X size={17} /></button>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-line shrink-0">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
            <input
              className="input !pl-8"
              placeholder="Search images…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton aspect-square rounded-lg" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-16 text-ink-subtle">
              <FolderOpen size={36} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No images yet. Upload some!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setSelected(img)}
                  className={`group relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all aspect-square bg-surface-2
                    ${selected?.id === img.id ? 'border-primary shadow-glow' : 'border-transparent hover:border-line'}`}
                >
                  <img src={img.url} alt={img.alt_text || img.filename} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end gap-1 p-1.5">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); copyUrl(img.url); }}
                      className="p-1 bg-white/20 rounded text-white hover:bg-white/40"
                      title="Copy URL"
                    >
                      {copied === img.url ? <Check size={11} /> : <Copy size={11} />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }}
                      className="p-1 bg-white/20 rounded text-white hover:bg-danger"
                      title="Delete"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-line shrink-0">
          <span className="text-[12px] text-ink-subtle">{total} images</span>
          <div className="flex items-center gap-2">
            {selected && (
              <button
                type="button"
                onClick={() => { onSelect?.(selected.url); onClose?.(); }}
                className="btn-primary !text-xs"
              >
                Insert selected
              </button>
            )}
            <button type="button" onClick={onClose} className="btn-secondary !text-xs">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
