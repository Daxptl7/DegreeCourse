const AdminMetricCard = ({ title, value, subtitle, icon: Icon, accent = 'from-red-500 to-red-700' }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
          {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`rounded-2xl bg-gradient-to-br ${accent} p-3 text-white shadow-lg`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMetricCard;
