import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminModal from '../../components/admin/AdminModal';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AnalyticsModule from '../../components/admin/modules/AnalyticsModule';
import CommunicationModule from '../../components/admin/modules/CommunicationModule';
import CoursesModule from '../../components/admin/modules/CoursesModule';
import DashboardModule from '../../components/admin/modules/DashboardModule';
import SecurityModule from '../../components/admin/modules/SecurityModule';
import SettingsModule from '../../components/admin/modules/SettingsModule';
import UsersModule from '../../components/admin/modules/UsersModule';
import { useAuth } from '../../context/AuthContext';
import useAdminAccess from '../../hooks/useAdminAccess';
import useAdminPortal from '../../hooks/useAdminPortal';

const sectionMeta = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'University-wide visibility into users, courses, moderation load, and growth.'
  },
  users: {
    title: 'Users',
    subtitle: 'Approve teachers, manage account state, inspect profiles, and run bulk operations.'
  },
  courses: {
    title: 'Courses',
    subtitle: 'Moderate pending submissions, update metadata, and promote standout content.'
  },
  communication: {
    title: 'Communication',
    subtitle: 'Schedule banners and notifications for specific schools, roles, and courses.'
  },
  analytics: {
    title: 'Analytics',
    subtitle: 'Understand performance, engagement, drop-off, and assignment completion trends.'
  },
  security: {
    title: 'Security & Monitoring',
    subtitle: 'Track admin actions, suspicious logins, API errors, and login telemetry in one place.'
  },
  settings: {
    title: 'Organization Config',
    subtitle: 'Manage PDEU schools and category-to-department mappings.'
  }
};

const renderUserDetail = (selectedUser) => {
  if (!selectedUser) {
    return null;
  }

  const { profile, createdCourses, activityLogs, loginActivity } = selectedUser;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Role</p>
          <div className="mt-3">
            <AdminStatusBadge value={profile.role} />
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Account Status</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <AdminStatusBadge value={profile.status} />
            <AdminStatusBadge value={profile.approvalStatus} />
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Last Login</p>
          <p className="mt-3 text-sm text-white">{profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : 'Never'}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h4 className="text-lg font-semibold text-white">Profile Details</h4>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p><span className="text-slate-500">Name:</span> {profile.name}</p>
            <p><span className="text-slate-500">Email:</span> {profile.email}</p>
            <p><span className="text-slate-500">Phone:</span> {profile.phone || 'Not provided'}</p>
            <p><span className="text-slate-500">School:</span> {profile.school || 'Not assigned'}</p>
            <p><span className="text-slate-500">PDEU ID:</span> {profile.personId || 'Not assigned'}</p>
            <p><span className="text-slate-500">Joined:</span> {new Date(profile.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h4 className="text-lg font-semibold text-white">Courses</h4>
          <div className="mt-4 space-y-3">
            {[...(profile.enrolledCourses || []), ...createdCourses].slice(0, 6).map((course) => (
              <div key={course._id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                <p className="font-medium text-white">{course.name}</p>
                <p className="mt-1 text-xs text-slate-400">{course.category || 'Uncategorized'}</p>
              </div>
            ))}
            {!profile.enrolledCourses?.length && !createdCourses.length && (
              <p className="text-sm text-slate-400">No course activity yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h4 className="text-lg font-semibold text-white">Activity Logs</h4>
          <div className="mt-4 space-y-3">
            {activityLogs.map((item) => (
              <div key={item._id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                <p className="font-medium text-white">{item.action.replace(/_/g, ' ')}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {!activityLogs.length && <p className="text-sm text-slate-400">No activity logs recorded.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h4 className="text-lg font-semibold text-white">Login Activity</h4>
          <div className="mt-4 space-y-3">
            {loginActivity.map((item) => (
              <div key={item._id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{item.reason.replace(/_/g, ' ')}</p>
                  <AdminStatusBadge value={item.status} />
                </div>
                <p className="mt-1 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {!loginActivity.length && <p className="text-sm text-slate-400">No login telemetry recorded.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPortal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const access = useAdminAccess();
  const portal = useAdminPortal();

  const currentSection = location.pathname.split('/')[2] || 'dashboard';
  const currentMeta = sectionMeta[currentSection] || sectionMeta.dashboard;

  useEffect(() => {
    if (!sectionMeta[currentSection]) {
      navigate('/admin', { replace: true });
    }
  }, [currentSection, navigate]);

  const schoolOptions = Array.from(new Set([
    ...(portal.settings.schools || []).map((school) => school.code),
    ...((portal.users.data || []).map((item) => item.school).filter(Boolean))
  ]));

  const renderSection = () => {
    switch (currentSection) {
      case 'users':
        return (
          <UsersModule
            users={portal.users}
            filters={portal.userFilters}
            setFilters={portal.setUserFilters}
            loading={portal.loading.users || portal.loading.action}
            onViewUser={portal.loadUserDetail}
            onStatusChange={portal.updateUserStatus}
            onApprovalChange={portal.updateUserApproval}
            onBulkAction={portal.bulkUserAction}
            onDeleteUser={async (userId) => {
              if (window.confirm('Delete this user account permanently?')) {
                await portal.removeUser(userId);
              }
            }}
            canManageUsers={access.canManageUsers}
            canModerate={access.canModerate}
            schoolOptions={schoolOptions}
          />
        );
      case 'courses':
        return (
          <CoursesModule
            courses={portal.courses}
            filters={portal.courseFilters}
            setFilters={portal.setCourseFilters}
            loading={portal.loading.courses || portal.loading.action}
            canModerate={access.canModerate}
            canManageCourses={access.canManageUsers}
            onReviewCourse={portal.moderateCourse}
            onSaveCourse={portal.saveCourse}
            onToggleFeature={portal.toggleCourseFeature}
            onArchiveCourse={portal.archiveCourse}
          />
        );
      case 'communication':
        return (
          <CommunicationModule
            announcements={portal.announcements}
            filters={portal.announcementFilters}
            setFilters={portal.setAnnouncementFilters}
            canManageAnnouncements={access.canManageAnnouncements}
            onSaveAnnouncement={portal.saveAnnouncement}
            onDeleteAnnouncement={async (announcementId) => {
              if (window.confirm('Delete this announcement?')) {
                await portal.removeAnnouncement(announcementId);
              }
            }}
          />
        );
      case 'analytics':
        return <AnalyticsModule analytics={portal.analytics} loading={portal.loading.analytics} />;
      case 'security':
        return <SecurityModule security={portal.security} loading={portal.loading.security} />;
      case 'settings':
        return (
          <SettingsModule
            settings={portal.settings}
            canManageSettings={access.canManageSettings}
            onSaveSchool={portal.saveSchool}
            onDeleteSchool={async (schoolId) => {
              if (window.confirm('Delete this school mapping?')) {
                await portal.removeSchool(schoolId);
              }
            }}
            onSaveCategory={portal.saveCategory}
            onDeleteCategory={async (categoryId) => {
              if (window.confirm('Delete this category mapping?')) {
                await portal.removeCategory(categoryId);
              }
            }}
          />
        );
      case 'dashboard':
      default:
        return <DashboardModule dashboard={portal.dashboard} loading={portal.loading.dashboard} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-16 top-0 h-72 w-72 rounded-full bg-red-700/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-cyan-600/15 blur-3xl" />
      </div>

      <AdminSidebar user={user} onLogout={logout} />

      <main className="relative px-4 pb-10 pt-6 lg:pl-[22rem] lg:pr-8">
        <header className="mb-6 rounded-[32px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-red-300">Control Surface</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">{currentMeta.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">{currentMeta.subtitle}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Role</p>
                <div className="mt-2">
                  <AdminStatusBadge value={user?.role} />
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Quick Refresh</p>
                <button
                  type="button"
                  onClick={() => portal.refreshAll()}
                  className="mt-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>

          {(portal.notice || portal.error) && (
            <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
              portal.notice?.type === 'success'
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
                : 'border-rose-500/20 bg-rose-500/10 text-rose-100'
            }`}>
              {portal.notice?.message || portal.error}
            </div>
          )}
        </header>

        {renderSection()}
      </main>

      <AdminModal
        open={Boolean(portal.selectedUser)}
        title={portal.selectedUser?.profile?.name || 'User Profile'}
        description="Review enrolled courses, login activity, and user history."
        onClose={portal.clearSelectedUser}
      >
        {renderUserDetail(portal.selectedUser)}
      </AdminModal>
    </div>
  );
};

export default AdminPortal;
