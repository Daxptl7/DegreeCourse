import { useState } from 'react';
import AdminCard from '../AdminCard';
import AdminModal from '../AdminModal';
import AdminStatusBadge from '../AdminStatusBadge';
import AdminTable from '../AdminTable';

const emptyForm = {
  name: '',
  category: '',
  subtitle: '',
  description: '',
  provider: '',
  price: 0
};

const CoursesModule = ({
  courses,
  filters,
  setFilters,
  loading,
  canModerate,
  canManageCourses,
  onReviewCourse,
  onSaveCourse,
  onToggleFeature,
  onArchiveCourse
}) => {
  const [reviewState, setReviewState] = useState(null);
  const [editCourse, setEditCourse] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const rows = courses?.data || [];
  const pagination = courses?.pagination || {};

  const startEdit = (course) => {
    setEditCourse(course);
    setEditForm({
      name: course.name || '',
      category: course.category || '',
      subtitle: course.subtitle || '',
      description: course.description || '',
      provider: course.provider || '',
      price: course.price || 0
    });
  };

  const columns = [
    {
      key: 'name',
      label: 'Course',
      render: (course) => (
        <div>
          <p className="font-medium text-white">{course.name}</p>
          <p className="mt-1 text-xs text-slate-400">{course.instructor?.name || 'Unknown instructor'}</p>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (course) => course.category || 'Uncategorized'
    },
    {
      key: 'status',
      label: 'Status',
      render: (course) => (
        <div className="space-y-2">
          <AdminStatusBadge value={course.status} />
          {course.isFeatured && <AdminStatusBadge value="featured" />}
        </div>
      )
    },
    {
      key: 'ratings',
      label: 'Ratings',
      render: (course) => (
        <div>
          <p className="font-medium text-white">{course.ratings}</p>
          <p className="text-xs text-slate-400">{course.reviewCount} review(s)</p>
        </div>
      )
    },
    {
      key: 'enrollments',
      label: 'Enrollments',
      render: (course) => course.enrollments
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (course) => (
        <div className="flex flex-wrap gap-2">
          {canModerate && (
            <>
              <button
                type="button"
                onClick={() => onReviewCourse(course._id, 'approved')}
                className="rounded-full border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/10"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => setReviewState({ courseId: course._id, status: 'rejected', name: course.name })}
                className="rounded-full border border-rose-500/30 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/10"
              >
                Reject
              </button>
            </>
          )}

          {canManageCourses && (
            <>
              <button
                type="button"
                onClick={() => startEdit(course)}
                className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-white/20 hover:text-white"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onToggleFeature(course._id, !course.isFeatured)}
                className="rounded-full border border-sky-500/30 px-3 py-1 text-xs font-semibold text-sky-200 transition hover:bg-sky-500/10"
              >
                {course.isFeatured ? 'Unfeature' : 'Feature'}
              </button>
              <button
                type="button"
                onClick={() => onArchiveCourse(course._id, course.status !== 'archived')}
                className="rounded-full border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/10"
              >
                {course.status === 'archived' ? 'Restore' : 'Archive'}
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <AdminCard
        title="Course Moderation"
        subtitle="Review, feature, archive, and adjust course metadata without leaving the control center."
      >
        <div className="grid gap-4 lg:grid-cols-4">
          <input
            type="text"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
            placeholder="Search courses"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
          />
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={filters.featured}
            onChange={(event) => setFilters((current) => ({ ...current, featured: event.target.value, page: 1 }))}
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="all">All Courses</option>
            <option value="true">Featured Only</option>
            <option value="false">Non-featured</option>
          </select>
          <input
            type="text"
            value={filters.category === 'all' ? '' : filters.category}
            onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value || 'all', page: 1 }))}
            placeholder="Category filter"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>
      </AdminCard>

      <AdminCard
        title="Course Queue"
        subtitle={loading ? 'Refreshing course inventory...' : `${pagination.total || 0} courses found`}
      >
        <AdminTable columns={columns} rows={rows} emptyMessage="No courses match the current filters." />
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

      <AdminModal
        open={Boolean(reviewState)}
        title="Reject Course"
        description="Capture a rejection reason so the creator has actionable feedback."
        onClose={() => setReviewState(null)}
        width="max-w-2xl"
      >
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const reason = event.target.reason.value;
            await onReviewCourse(reviewState.courseId, reviewState.status, reason);
            setReviewState(null);
          }}
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            {reviewState?.name}
          </div>
          <textarea
            name="reason"
            rows="5"
            placeholder="Why is this course being rejected?"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            required
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setReviewState(null)}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(editCourse)}
        title="Edit Course Metadata"
        description="Adjust course metadata without affecting the underlying learning content."
        onClose={() => setEditCourse(null)}
      >
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            await onSaveCourse(editCourse._id, {
              ...editForm,
              price: Number(editForm.price || 0)
            });
            setEditCourse(null);
          }}
        >
          <input
            value={editForm.name}
            onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Course name"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          />
          <input
            value={editForm.category}
            onChange={(event) => setEditForm((current) => ({ ...current, category: event.target.value }))}
            placeholder="Category"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          />
          <input
            value={editForm.provider}
            onChange={(event) => setEditForm((current) => ({ ...current, provider: event.target.value }))}
            placeholder="Provider"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          />
          <input
            type="number"
            min="0"
            value={editForm.price}
            onChange={(event) => setEditForm((current) => ({ ...current, price: event.target.value }))}
            placeholder="Price"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          />
          <input
            value={editForm.subtitle}
            onChange={(event) => setEditForm((current) => ({ ...current, subtitle: event.target.value }))}
            placeholder="Subtitle"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none md:col-span-2"
          />
          <textarea
            rows="5"
            value={editForm.description}
            onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Description"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none md:col-span-2"
          />
          <div className="flex justify-end gap-3 md:col-span-2">
            <button
              type="button"
              onClick={() => setEditCourse(null)}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default CoursesModule;
