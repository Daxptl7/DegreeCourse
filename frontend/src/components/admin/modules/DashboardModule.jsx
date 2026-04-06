import {
  Activity,
  BookOpenCheck,
  Star,
  UserCheck,
  Users
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import AdminCard from '../AdminCard';
import AdminMetricCard from '../AdminMetricCard';
import AdminStatusBadge from '../AdminStatusBadge';

const PIE_COLORS = ['#ef4444', '#fb7185', '#f97316', '#06b6d4', '#6366f1', '#facc15'];

const DashboardModule = ({ dashboard, loading }) => {
  if (loading && !dashboard) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-10 text-center text-slate-300">
        Loading dashboard intelligence...
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/40 p-10 text-center text-slate-400">
        Dashboard data is not available yet.
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Total Users',
      value: dashboard.metrics.totalUsers,
      subtitle: 'Students and teachers across the platform',
      icon: Users,
      accent: 'from-red-500 to-rose-700'
    },
    {
      title: 'Active Users',
      value: dashboard.metrics.activeUsers,
      subtitle: 'Accounts currently active in the system',
      icon: UserCheck,
      accent: 'from-emerald-500 to-emerald-700'
    },
    {
      title: 'Total Courses',
      value: dashboard.metrics.totalCourses,
      subtitle: `${dashboard.metrics.pendingCourses} awaiting approval`,
      icon: BookOpenCheck,
      accent: 'from-cyan-500 to-sky-700'
    },
    {
      title: 'Enrollments',
      value: dashboard.metrics.totalEnrollments,
      subtitle: `Average rating ${dashboard.metrics.averageRatings}`,
      icon: Star,
      accent: 'from-amber-400 to-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <AdminMetricCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <AdminCard
          title="Monthly User Growth"
          subtitle="New user registrations over the last six months"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboard.charts.monthlyUserGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        <AdminCard
          title="Category Distribution"
          subtitle="How approved content is distributed by category"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboard.charts.categoryDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={3}
                >
                  {dashboard.charts.categoryDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminCard
          title="Course Engagement"
          subtitle="Top courses by enrollments and completion rate"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.charts.courseEngagement}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Legend />
                <Bar dataKey="enrollments" fill="#ef4444" radius={[8, 8, 0, 0]} />
                <Bar dataKey="completionRate" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        <AdminCard
          title="Organization Snapshot"
          subtitle="Administrative footprint of the PDEU setup"
        >
          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Schools Managed</p>
              <p className="mt-3 text-3xl font-semibold text-white">{dashboard.organization.totalSchools}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Category Mappings</p>
              <p className="mt-3 text-3xl font-semibold text-white">{dashboard.organization.totalCategories}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Recent Activity Feed</p>
                  <p className="mt-2 text-sm text-slate-300">Last {dashboard.recentActivity.length} tracked admin actions</p>
                </div>
                <Activity className="text-red-300" size={18} />
              </div>
            </div>
          </div>
        </AdminCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard
          title="Recent Activity"
          subtitle="Last 10 moderation and configuration events"
        >
          <div className="space-y-3">
            {dashboard.recentActivity.map((activity) => (
              <div key={activity._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{activity.action.replace(/_/g, ' ')}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {activity.actor?.name || 'System'} • {activity.module}
                    </p>
                  </div>
                  <AdminStatusBadge value={activity.module} />
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard
          title="Top Performing Courses"
          subtitle="Best mix of enrollments and student sentiment"
        >
          <div className="space-y-3">
            {dashboard.topPerformingCourses.map((course) => (
              <div key={course._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{course.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{course.category} • {course.instructor}</p>
                  </div>
                  <AdminStatusBadge value={course.status} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Enrollments</p>
                    <p className="mt-1 text-lg font-semibold text-white">{course.enrollments}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Rating</p>
                    <p className="mt-1 text-lg font-semibold text-white">{course.averageRating}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Reviews</p>
                    <p className="mt-1 text-lg font-semibold text-white">{course.totalReviews}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  );
};

export default DashboardModule;
