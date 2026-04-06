const COLOR_MAP = {
  active: 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30',
  approved: 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30',
  published: 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30',
  success: 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30',
  pending: 'bg-amber-500/15 text-amber-200 ring-amber-500/30',
  scheduled: 'bg-amber-500/15 text-amber-200 ring-amber-500/30',
  draft: 'bg-slate-500/15 text-slate-200 ring-slate-500/30',
  suspended: 'bg-rose-500/15 text-rose-200 ring-rose-500/30',
  rejected: 'bg-rose-500/15 text-rose-200 ring-rose-500/30',
  archived: 'bg-slate-500/15 text-slate-200 ring-slate-500/30',
  inactive: 'bg-slate-500/15 text-slate-200 ring-slate-500/30',
  featured: 'bg-violet-500/15 text-violet-200 ring-violet-500/30',
  normal: 'bg-slate-500/15 text-slate-200 ring-slate-500/30',
  high: 'bg-orange-500/15 text-orange-200 ring-orange-500/30',
  critical: 'bg-rose-500/15 text-rose-200 ring-rose-500/30',
  moderator: 'bg-cyan-500/15 text-cyan-200 ring-cyan-500/30',
  admin: 'bg-red-500/15 text-red-200 ring-red-500/30',
  super_admin: 'bg-fuchsia-500/15 text-fuchsia-200 ring-fuchsia-500/30',
  teacher: 'bg-cyan-500/15 text-cyan-200 ring-cyan-500/30',
  student: 'bg-sky-500/15 text-sky-200 ring-sky-500/30'
};

const formatLabel = (value) => String(value || '').replace(/_/g, ' ');

const AdminStatusBadge = ({ value }) => {
  const normalized = String(value || '').toLowerCase();
  const colorClass = COLOR_MAP[normalized] || 'bg-white/10 text-slate-200 ring-white/10';

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${colorClass}`}>
      {formatLabel(value)}
    </span>
  );
};

export default AdminStatusBadge;
