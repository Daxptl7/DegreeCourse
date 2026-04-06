import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  BookOpenCheck,
  LayoutDashboard,
  Megaphone,
  Settings,
  ShieldCheck,
  Users
} from 'lucide-react';

const navigationItems = [
  { key: 'dashboard', label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { key: 'users', label: 'Users', path: '/admin/users', icon: Users },
  { key: 'courses', label: 'Courses', path: '/admin/courses', icon: BookOpenCheck },
  { key: 'communication', label: 'Communication', path: '/admin/communication', icon: Megaphone },
  { key: 'analytics', label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { key: 'security', label: 'Security', path: '/admin/security', icon: ShieldCheck },
  { key: 'settings', label: 'Settings', path: '/admin/settings', icon: Settings }
];

const AdminSidebar = ({ user, onLogout }) => {
  return (
    <aside className="relative z-30 lg:fixed lg:inset-y-0 lg:left-0 lg:w-80 lg:p-6">
      <div className="mx-4 mt-4 overflow-x-auto rounded-[28px] border border-white/10 bg-slate-950/90 p-4 shadow-2xl shadow-slate-950/30 backdrop-blur lg:mx-0 lg:h-full lg:overflow-visible lg:p-6">
        <div className="mb-6 flex items-center justify-between gap-3 lg:block">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-red-300">UniLearn PDEU</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Admin Portal</h1>
            <p className="mt-2 text-sm text-slate-400">Centralized operations, moderation, and growth intelligence.</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-red-400/50 hover:text-white"
          >
            Logout
          </button>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Signed In As</p>
          <p className="mt-2 text-lg font-semibold text-white">{user?.name || 'Admin User'}</p>
          <p className="mt-1 text-sm text-slate-400">{user?.email}</p>
          <span className="mt-3 inline-flex rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-200">
            {String(user?.role || '').replace(/_/g, ' ')}
          </span>
        </div>

        <nav className="flex gap-2 lg:flex-col">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.key}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) => `group flex min-w-fit items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-950/40'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;
