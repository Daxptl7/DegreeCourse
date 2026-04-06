import { useState } from 'react';
import AdminCard from '../AdminCard';
import AdminModal from '../AdminModal';
import AdminStatusBadge from '../AdminStatusBadge';

const toCsv = (items = []) => items.join(', ');

const parseCsv = (value) => value
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const baseForm = {
  title: '',
  content: '',
  channel: 'banner',
  priority: 'normal',
  status: 'published',
  scheduledFor: '',
  schools: '',
  roles: '',
  courseIds: ''
};

const CommunicationModule = ({
  announcements,
  filters,
  setFilters,
  canManageAnnouncements,
  onSaveAnnouncement,
  onDeleteAnnouncement
}) => {
  const [formState, setFormState] = useState(baseForm);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const sortedAnnouncements = [...announcements].sort(
    (left, right) => new Date(right.createdAt) - new Date(left.createdAt)
  );

  const openEditor = (announcement) => {
    if (!announcement) {
      setEditingAnnouncement({ id: null });
      setFormState(baseForm);
      return;
    }

    setEditingAnnouncement({ id: announcement._id });
    setFormState({
      title: announcement.title || '',
      content: announcement.content || '',
      channel: announcement.channel || 'banner',
      priority: announcement.priority || 'normal',
      status: announcement.status || 'published',
      scheduledFor: announcement.scheduledFor ? announcement.scheduledFor.slice(0, 16) : '',
      schools: toCsv(announcement.audience?.schools),
      roles: toCsv(announcement.audience?.roles),
      courseIds: toCsv((announcement.audience?.courseIds || []).map((course) => course._id || course))
    });
  };

  return (
    <div className="space-y-6">
      <AdminCard
        title="Announcements & Notifications"
        subtitle="Create platform-wide banners or targeted notices by school, role, or course."
        actions={canManageAnnouncements ? (
          <button
            type="button"
            onClick={() => openEditor(null)}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            New Announcement
          </button>
        ) : null}
      >
        <div className="max-w-xs">
          <select
            value={filters.status}
            onChange={(event) => setFilters({ status: event.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </AdminCard>

      <div className="grid gap-4">
        {sortedAnnouncements.map((announcement) => (
          <AdminCard
            key={announcement._id}
            title={announcement.title}
            subtitle={`Created by ${announcement.createdBy?.name || 'Admin'} on ${new Date(announcement.createdAt).toLocaleString()}`}
            actions={(
              <div className="flex flex-wrap gap-2">
                <AdminStatusBadge value={announcement.status} />
                <AdminStatusBadge value={announcement.priority} />
                {canManageAnnouncements && (
                  <>
                    <button
                      type="button"
                      onClick={() => openEditor(announcement)}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-white/20 hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteAnnouncement(announcement._id)}
                      className="rounded-full border border-rose-500/30 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/10"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          >
            <p className="text-sm leading-7 text-slate-300">{announcement.content}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Schools</p>
                <p className="mt-2 text-sm text-white">{announcement.audience?.schools?.join(', ') || 'All schools'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Roles</p>
                <p className="mt-2 text-sm text-white">{announcement.audience?.roles?.join(', ') || 'All roles'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Schedule</p>
                <p className="mt-2 text-sm text-white">
                  {announcement.scheduledFor ? new Date(announcement.scheduledFor).toLocaleString() : 'Send immediately'}
                </p>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      <AdminModal
        open={Boolean(editingAnnouncement)}
        title={editingAnnouncement?.id ? 'Edit Announcement' : 'Create Announcement'}
        description="Schedule a banner, notification, or email for a specific audience segment."
        onClose={() => setEditingAnnouncement(null)}
      >
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            await onSaveAnnouncement({
              title: formState.title,
              content: formState.content,
              channel: formState.channel,
              priority: formState.priority,
              status: formState.status,
              scheduledFor: formState.scheduledFor || undefined,
              audience: {
                schools: parseCsv(formState.schools),
                roles: parseCsv(formState.roles),
                courseIds: parseCsv(formState.courseIds)
              }
            }, editingAnnouncement?.id);

            setEditingAnnouncement(null);
            setFormState(baseForm);
          }}
        >
          <input
            value={formState.title}
            onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
            placeholder="Announcement title"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none md:col-span-2"
            required
          />
          <select
            value={formState.channel}
            onChange={(event) => setFormState((current) => ({ ...current, channel: event.target.value }))}
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="banner">Banner</option>
            <option value="notification">Notification</option>
            <option value="email">Email</option>
          </select>
          <select
            value={formState.priority}
            onChange={(event) => setFormState((current) => ({ ...current, priority: event.target.value }))}
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={formState.status}
            onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value }))}
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="published">Publish now</option>
            <option value="scheduled">Schedule</option>
            <option value="draft">Draft</option>
          </select>
          <input
            type="datetime-local"
            value={formState.scheduledFor}
            onChange={(event) => setFormState((current) => ({ ...current, scheduledFor: event.target.value }))}
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          />
          <textarea
            rows="6"
            value={formState.content}
            onChange={(event) => setFormState((current) => ({ ...current, content: event.target.value }))}
            placeholder="Write the announcement body"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none md:col-span-2"
            required
          />
          <input
            value={formState.schools}
            onChange={(event) => setFormState((current) => ({ ...current, schools: event.target.value }))}
            placeholder="Schools CSV, e.g. SOT, SPT"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          />
          <input
            value={formState.roles}
            onChange={(event) => setFormState((current) => ({ ...current, roles: event.target.value }))}
            placeholder="Roles CSV, e.g. student, teacher"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          />
          <input
            value={formState.courseIds}
            onChange={(event) => setFormState((current) => ({ ...current, courseIds: event.target.value }))}
            placeholder="Target course IDs CSV (optional)"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none md:col-span-2"
          />
          <div className="flex justify-end gap-3 md:col-span-2">
            <button
              type="button"
              onClick={() => setEditingAnnouncement(null)}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              Save Announcement
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default CommunicationModule;
