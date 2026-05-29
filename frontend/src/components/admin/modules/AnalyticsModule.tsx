import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import AdminCard from '../AdminCard';
import AdminTable from '../AdminTable';

const AnalyticsModule = ({ analytics, loading }) => {
  if (loading && !analytics) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-10 text-center text-slate-300">
        Loading analytics...
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/40 p-10 text-center text-slate-400">
        Analytics are not available yet.
      </div>
    );
  }

  const columns = [
    { key: 'name', label: 'Course' },
    { key: 'category', label: 'Category' },
    { key: 'enrollments', label: 'Enrollments' },
    { key: 'averageRating', label: 'Rating' },
    { key: 'completionRate', label: 'Completion %' },
    { key: 'dropOffRate', label: 'Drop-off %' },
    { key: 'assignmentSubmissionRate', label: 'Submission %' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <AdminCard title="Completion Rate">
          <p className="text-4xl font-semibold text-white">{analytics.summary.overallCompletionRate}%</p>
        </AdminCard>
        <AdminCard title="Drop-off Rate">
          <p className="text-4xl font-semibold text-white">{analytics.summary.overallDropOffRate}%</p>
        </AdminCard>
        <AdminCard title="Assignment Submission Rate">
          <p className="text-4xl font-semibold text-white">{analytics.summary.averageAssignmentSubmissionRate}%</p>
        </AdminCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard title="Student Engagement Trend" subtitle="Course access activity by month">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.studentEngagementTrend}>
                <defs>
                  <linearGradient id="engagementFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="url(#engagementFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        <AdminCard title="Assignment Submission Rates" subtitle="Course-wise submission readiness">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.assignmentSubmissionRates}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Bar dataKey="assignmentSubmissionRate" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>
      </div>

      <AdminCard title="Course-wise Performance" subtitle="Outcomes, ratings, and engagement in one view">
        <AdminTable columns={columns} rows={analytics.coursePerformance} emptyMessage="No course analytics available." />
      </AdminCard>
    </div>
  );
};

export default AnalyticsModule;
