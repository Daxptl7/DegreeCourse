import { useState } from 'react';
import AdminCard from '../AdminCard';
import AdminModal from '../AdminModal';
import AdminTable from '../AdminTable';

const emptySchoolForm = {
  name: '',
  code: '',
  description: '',
  departments: ''
};

const emptyCategoryForm = {
  name: '',
  slug: '',
  department: '',
  school: '',
  description: ''
};

const SettingsModule = ({
  settings,
  canManageSettings,
  onSaveSchool,
  onDeleteSchool,
  onSaveCategory,
  onDeleteCategory
}) => {
  const [schoolForm, setSchoolForm] = useState(emptySchoolForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingSchool, setEditingSchool] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  const openSchoolEditor = (school) => {
    setEditingSchool(school || { _id: null });
    setSchoolForm({
      name: school?.name || '',
      code: school?.code || '',
      description: school?.description || '',
      departments: school?.departments?.join(', ') || ''
    });
  };

  const openCategoryEditor = (category) => {
    setEditingCategory(category || { _id: null });
    setCategoryForm({
      name: category?.name || '',
      slug: category?.slug || '',
      department: category?.department || '',
      school: category?.school || '',
      description: category?.description || ''
    });
  };

  return (
    <div className="space-y-6">
      {!canManageSettings && (
        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
          Settings are visible for monitoring, but only the Super Admin can change organization configuration.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard
          title="Schools"
          subtitle="Manage active PDEU schools and their internal departments."
          actions={canManageSettings ? (
            <button
              type="button"
              onClick={() => openSchoolEditor(null)}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              Add School
            </button>
          ) : null}
        >
          <AdminTable
            columns={[
              { key: 'code', label: 'Code' },
              { key: 'name', label: 'School' },
              {
                key: 'departments',
                label: 'Departments',
                render: (row) => row.departments.join(', ') || 'Not mapped'
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => canManageSettings ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openSchoolEditor(row)}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-white/20"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSchool(row._id)}
                      className="rounded-full border border-rose-500/30 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/10"
                    >
                      Delete
                    </button>
                  </div>
                ) : 'View only'
              }
            ]}
            rows={settings.schools}
            emptyMessage="No schools configured yet."
          />
        </AdminCard>

        <AdminCard
          title="Categories"
          subtitle="Map course categories to departments and school context."
          actions={canManageSettings ? (
            <button
              type="button"
              onClick={() => openCategoryEditor(null)}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              Add Category
            </button>
          ) : null}
        >
          <AdminTable
            columns={[
              { key: 'name', label: 'Category' },
              { key: 'department', label: 'Department' },
              { key: 'school', label: 'School' },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => canManageSettings ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openCategoryEditor(row)}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-white/20"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCategory(row._id)}
                      className="rounded-full border border-rose-500/30 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/10"
                    >
                      Delete
                    </button>
                  </div>
                ) : 'View only'
              }
            ]}
            rows={settings.categories}
            emptyMessage="No categories configured yet."
          />
        </AdminCard>
      </div>

      <AdminModal
        open={Boolean(editingSchool)}
        title={editingSchool?._id ? 'Edit School' : 'Create School'}
        description="Maintain the PDEU school list and department mapping."
        onClose={() => setEditingSchool(null)}
        width="max-w-2xl"
      >
        <form
          className="grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            await onSaveSchool({
              ...schoolForm,
              departments: schoolForm.departments.split(',').map((item) => item.trim()).filter(Boolean)
            }, editingSchool?._id);
            setEditingSchool(null);
            setSchoolForm(emptySchoolForm);
          }}
        >
          <input
            value={schoolForm.name}
            onChange={(event) => setSchoolForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="School name"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            required
          />
          <input
            value={schoolForm.code}
            onChange={(event) => setSchoolForm((current) => ({ ...current, code: event.target.value }))}
            placeholder="School code"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            required
          />
          <input
            value={schoolForm.departments}
            onChange={(event) => setSchoolForm((current) => ({ ...current, departments: event.target.value }))}
            placeholder="Departments CSV"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          />
          <textarea
            rows="4"
            value={schoolForm.description}
            onChange={(event) => setSchoolForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="School description"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingSchool(null)}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              Save School
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(editingCategory)}
        title={editingCategory?._id ? 'Edit Category' : 'Create Category'}
        description="Tie categories to departments so moderation and analytics stay organized."
        onClose={() => setEditingCategory(null)}
        width="max-w-2xl"
      >
        <form
          className="grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            await onSaveCategory(categoryForm, editingCategory?._id);
            setEditingCategory(null);
            setCategoryForm(emptyCategoryForm);
          }}
        >
          <input
            value={categoryForm.name}
            onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Category name"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            required
          />
          <input
            value={categoryForm.slug}
            onChange={(event) => setCategoryForm((current) => ({ ...current, slug: event.target.value }))}
            placeholder="Slug"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            required
          />
          <input
            value={categoryForm.department}
            onChange={(event) => setCategoryForm((current) => ({ ...current, department: event.target.value }))}
            placeholder="Department"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            required
          />
          <input
            value={categoryForm.school}
            onChange={(event) => setCategoryForm((current) => ({ ...current, school: event.target.value }))}
            placeholder="School code"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          />
          <textarea
            rows="4"
            value={categoryForm.description}
            onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Category description"
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingCategory(null)}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              Save Category
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default SettingsModule;
