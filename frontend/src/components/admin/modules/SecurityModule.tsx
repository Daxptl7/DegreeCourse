import AdminCard from '../AdminCard';
import AdminStatusBadge from '../AdminStatusBadge';
import AdminTable from '../AdminTable';

const SecurityModule = ({ security, loading }) => {
  if (loading && !security) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-10 text-center text-slate-300">
        Loading security telemetry...
      </div>
    );
  }

  if (!security) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/40 p-10 text-center text-slate-400">
        Security telemetry is not available yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <AdminCard title="Login Attempts">
          <p className="text-4xl font-semibold text-white">{security.summary.totalLoginAttempts}</p>
          <p className="mt-2 text-sm text-slate-400">Past 24 hours</p>
        </AdminCard>
        <AdminCard title="Failed Attempts">
          <p className="text-4xl font-semibold text-white">{security.summary.failedLoginAttempts}</p>
          <p className="mt-2 text-sm text-slate-400">Past 24 hours</p>
        </AdminCard>
        <AdminCard title="Suspicious Attempts">
          <p className="text-4xl font-semibold text-white">{security.summary.suspiciousAttempts}</p>
          <p className="mt-2 text-sm text-slate-400">Flagged by detection rules</p>
        </AdminCard>
        <AdminCard title="API Errors">
          <p className="text-4xl font-semibold text-white">{security.summary.apiErrors}</p>
          <p className="mt-2 text-sm text-slate-400">Captured in the last 24 hours</p>
        </AdminCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard title="Recent Login Activity">
          <AdminTable
            columns={[
              {
                key: 'email',
                label: 'Account',
                render: (row) => (
                  <div>
                    <p className="font-medium text-white">{row.user?.name || row.email}</p>
                    <p className="mt-1 text-xs text-slate-400">{row.email}</p>
                  </div>
                )
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <AdminStatusBadge value={row.status} />
              },
              {
                key: 'reason',
                label: 'Reason',
                render: (row) => row.reason.replace(/_/g, ' ')
              },
              {
                key: 'createdAt',
                label: 'Time',
                render: (row) => new Date(row.createdAt).toLocaleString()
              }
            ]}
            rows={security.recentLoginActivity}
            emptyMessage="No login telemetry recorded."
          />
        </AdminCard>

        <AdminCard title="Suspicious Activity">
          <AdminTable
            columns={[
              { key: 'email', label: 'Account' },
              {
                key: 'detectedRules',
                label: 'Rules',
                render: (row) => row.detectedRules.join(', ') || 'Flagged'
              },
              { key: 'ipAddress', label: 'IP Address' },
              {
                key: 'createdAt',
                label: 'Time',
                render: (row) => new Date(row.createdAt).toLocaleString()
              }
            ]}
            rows={security.suspiciousActivity}
            emptyMessage="No suspicious events detected."
          />
        </AdminCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard title="API Error Logs">
          <AdminTable
            columns={[
              { key: 'method', label: 'Method' },
              { key: 'path', label: 'Path' },
              { key: 'message', label: 'Message' },
              { key: 'statusCode', label: 'Status' }
            ]}
            rows={security.apiErrors}
            emptyMessage="No API errors logged."
          />
        </AdminCard>

        <AdminCard title="Admin Action Logs">
          <AdminTable
            columns={[
              {
                key: 'action',
                label: 'Action',
                render: (row) => row.action.replace(/_/g, ' ')
              },
              { key: 'module', label: 'Module' },
              {
                key: 'actor',
                label: 'Actor',
                render: (row) => row.actor?.name || 'System'
              },
              {
                key: 'createdAt',
                label: 'Time',
                render: (row) => new Date(row.createdAt).toLocaleString()
              }
            ]}
            rows={security.adminActions}
            emptyMessage="No admin actions recorded."
          />
        </AdminCard>
      </div>
    </div>
  );
};

export default SecurityModule;
