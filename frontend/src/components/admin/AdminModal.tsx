const AdminModal = ({ open, title, description, children, onClose, width = 'max-w-3xl' }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
      <div className={`relative w-full ${width} overflow-hidden rounded-[32px] border border-white/10 bg-slate-950 shadow-2xl`}>
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            Close
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
