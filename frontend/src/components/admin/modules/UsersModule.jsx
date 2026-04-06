import { useState } from 'react';
import AdminCard from '../AdminCard';
import AdminStatusBadge from '../AdminStatusBadge';
import AdminTable from '../AdminTable';

const UsersModule = ({
  users,
  filters,
  setFilters,
  loading,
  onViewUser,
  onStatusChange,
  onApprovalChange,
  onBulkAction,
  onDeleteUser,
  canManageUsers,
  canModerate,
  schoolOptions = []
}) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  const rows = users?.data || [];
  const pagination = users?.pagination || {};

  const toggleRowSelection = (userId) => {
    setSelectedIds((current) => (
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    ));
  };

  const toggleAll = () => {
    if (selectedIds.length === rows.length) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(rows.map((row) => row._id));
  };

  const handleBulkAction = async () => {
    if (!bulkAction || !selectedIds.length) {
      return;
    }

    await onBulkAction(selectedIds, bulkAction);
    setSelectedIds([]);
    setBulkAction('');
  };

  const bulkOptions = [
    { label: 'Activate selected', value: 'activate', visible: canManageUsers },
    { label: 'Suspend selected', value: 'suspend', visible: canManageUsers },
    { label: 'Approve selected', value: 'approve', visible: canModerate },
    { label: 'Reject selected', value: 'reject', visible: canModerate },
    { label: 'Delete selected', value: 'delete', visible: canManageUsers }
  ].filter((option) => option.visible);

  const columns = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={rows.length > 0 && selectedIds.length === rows.length}
          onChange={toggleAll}
          className="h-4 w-4 rounded border-white/10 bg-slate-900 text-red-500 focus:ring-red-500"
        />
      ),
      render: (user) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(user._id)}
          onChange={() => toggleRowSelection(user._id)}
          className="h-4 w-4 rounded border-white/10 bg-slate-900 text-red-500 focus:ring-red-500"
        />
      )
    },
    {
      key: 'name',
      label: 'User',
      render: (user) => (
        <div>
          <p className="font-medium text-white">{user.name}</p>
          <p className="mt-1 text-xs text-slate-400">{user.email}</p>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (user) => <AdminStatusBadge value={user.role} />
    },
    {
      key: 'status',
      label: 'Status',
      render: (user) => (
        <div className="space-y-2">
          <AdminStatusBadge value={user.status} />
          <AdminStatusBadge value={user.approvalStatus} />
        </div>
      )
    },
    {
      key: 'school',
      label: 'School',
      render: (user) => user.school || 'Not assigned'
    },
    {
      key: 'lastLoginAt',
      label: 'Last Login',
      render: (user) => user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onViewUser(user._id)}
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-white/20 hover:text-white"
          >
            View
          </button>

          {canModerate && user.approvalStatus === 'pending' && (
            <>
              <button
                type="button"
                onClick={() => onApprovalChange(user._id, 'approved')}
                className="rounded-full border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/10"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => onApprovalChange(user._id, 'rejected')}
                className="rounded-full border border-rose-500/30 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/10"
              >
                Reject
              </button>
            </>
          )}

          {canManageUsers && user.status !== 'suspended' && (
            <button
              type="button"
              onClick={() => onStatusChange(user._id, 'suspended')}
              className="rounded-full border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/10"
            >
              Suspend
            </button>
          )}

          {canManageUsers && user.status === 'suspended' && (
            <button
              type="button"
              onClick={() => onStatusChange(user._id, 'active')}
              className="rounded-full border border-sky-500/30 px-3 py-1 text-xs font-semibold text-sky-200 transition hover:bg-sky-500/10"
            >
              Activate
            </button>
          )}

          {canManageUsers && (
            <button
              type="button"
              onClick={() => onDeleteUser(user._id)}
              className="rounded-full border border-rose-500/30 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/10"
            >
              Delete
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <AdminCard
        title="User Management"
        subtitle="Filter by role, school, and status. Teacher approval, suspension, and bulk moderation are available here."
      >
        <div className="grid gap-4 lg:grid-cols-5">
          <input
            type="text"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
            placeholder="Search by name, email, or PDEU ID"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500"
          />
          <select
            value={filters.role}
            onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value, page: 1 }))}
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filters.approvalStatus}
            onChange={(event) => setFilters((current) => ({ ...current, approvalStatus: event.target.value, page: 1 }))}
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="all">All Approval States</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filters.school}
            onChange={(event) => setFilters((current) => ({ ...current, school: event.target.value, page: 1 }))}
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="all">All Schools</option>
            {schoolOptions.map((school) => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>
        </div>
      </AdminCard>

      <AdminCard
        title="Bulk Actions"
        subtitle={`${selectedIds.length} user${selectedIds.length === 1 ? '' : 's'} selected`}
        actions={(
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={bulkAction}
              onChange={(event) => setBulkAction(event.target.value)}
              className="rounded-full border border-white/10 bg-slate-950 px-4 py-2 text-sm text-white outline-none"
            >
              <option value="">Choose action</option>
              {bulkOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleBulkAction}
              disabled={!selectedIds.length || !bulkAction || loading}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        )}
      >
        <AdminTable columns={columns} rows={rows} emptyMessage="No users match the current filters." />
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <p>
            Page {pagination.page || 1} of {pagination.totalPages || 1}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={(pagination.page || 1) <= 1}
              onClick={() => setFilters((current) => ({ ...current, page: Math.max((current.page || 1) - 1, 1) }))}
              className="rounded-full border border-white/10 px-4 py-2 transition hover:border-white/20 hover:text-white disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={(pagination.page || 1) >= (pagination.totalPages || 1)}
              onClick={() => setFilters((current) => ({ ...current, page: (current.page || 1) + 1 }))}
              className="rounded-full border border-white/10 px-4 py-2 transition hover:border-white/20 hover:text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </AdminCard>
    </div>
  );
};

export default UsersModule;
