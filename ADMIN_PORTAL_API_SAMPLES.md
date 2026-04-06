# UniLearn PDEU Admin Portal API Samples

## Core Endpoints

### `GET /api/admin/dashboard`
```json
{
  "success": true,
  "message": "Admin dashboard retrieved successfully",
  "data": {
    "metrics": {
      "totalUsers": 1240,
      "activeUsers": 1086,
      "totalCourses": 93,
      "pendingCourses": 11,
      "totalEnrollments": 4821,
      "averageRatings": 4.3
    },
    "charts": {
      "monthlyUserGrowth": [
        { "label": "Nov 25", "value": 42 },
        { "label": "Dec 25", "value": 57 }
      ],
      "courseEngagement": [
        { "name": "Data Structures", "enrollments": 342, "completionRate": 68.4 }
      ],
      "categoryDistribution": [
        { "name": "Computer Science", "value": 18 }
      ]
    },
    "recentActivity": [],
    "topPerformingCourses": []
  }
}
```

### `GET /api/admin/users?page=1&limit=8&role=teacher&approvalStatus=pending`
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "data": [
      {
        "_id": "6620a0012fe7e9f7990a4b10",
        "name": "Dr. Meera Shah",
        "email": "meera@pdeu.ac.in",
        "role": "teacher",
        "school": "SOT",
        "status": "active",
        "approvalStatus": "pending",
        "lastLoginAt": null,
        "personId": "PDEU-ALPHA123"
      }
    ],
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 8,
      "totalPages": 2
    }
  }
}
```

### `PUT /api/admin/users/:userId/approval`
```json
{
  "approvalStatus": "approved",
  "note": "Faculty credentials verified successfully."
}
```

### `GET /api/admin/courses?status=pending`
```json
{
  "success": true,
  "message": "Courses retrieved successfully",
  "data": {
    "data": [
      {
        "_id": "6620a1d12fe7e9f7990a4b99",
        "name": "Power Systems Basics",
        "category": "Electrical Engineering",
        "status": "pending",
        "isFeatured": false,
        "ratings": 4.6,
        "reviewCount": 14,
        "enrollments": 95,
        "instructor": {
          "_id": "6620a0012fe7e9f7990a4b10",
          "name": "Dr. Meera Shah",
          "email": "meera@pdeu.ac.in"
        }
      }
    ],
    "pagination": {
      "total": 11,
      "page": 1,
      "limit": 10,
      "totalPages": 2
    }
  }
}
```

### `POST /api/admin/announcements`
```json
{
  "title": "Mid-Sem Submission Window",
  "content": "Assignment submissions for SOT students close on Friday 5 PM.",
  "channel": "banner",
  "priority": "high",
  "status": "scheduled",
  "scheduledFor": "2026-04-10T11:00:00.000Z",
  "audience": {
    "schools": ["SOT"],
    "roles": ["student"],
    "courseIds": []
  }
}
```

### `GET /api/admin/analytics`
```json
{
  "success": true,
  "message": "Analytics retrieved successfully",
  "data": {
    "summary": {
      "overallCompletionRate": 61.8,
      "overallDropOffRate": 38.2,
      "averageAssignmentSubmissionRate": 72.4
    },
    "coursePerformance": [
      {
        "_id": "6620a1d12fe7e9f7990a4b99",
        "name": "Power Systems Basics",
        "category": "Electrical Engineering",
        "status": "approved",
        "enrollments": 95,
        "averageRating": 4.6,
        "completionRate": 71.2,
        "dropOffRate": 28.8,
        "assignmentSubmissionRate": 83.1
      }
    ]
  }
}
```

### `GET /api/admin/security`
```json
{
  "success": true,
  "message": "Security monitoring retrieved successfully",
  "data": {
    "summary": {
      "totalLoginAttempts": 114,
      "failedLoginAttempts": 19,
      "suspiciousAttempts": 4,
      "apiErrors": 7
    },
    "recentLoginActivity": [],
    "suspiciousActivity": [],
    "apiErrors": [],
    "adminActions": []
  }
}
```

## Role Matrix

| Role | Access |
| --- | --- |
| `super_admin` | Full platform control, config CRUD, announcements, destructive actions |
| `admin` | Users, courses, announcements, analytics, security |
| `moderator` | Approval workflows and monitoring dashboards |

## Frontend Structure

```text
frontend/src/
  components/admin/
    AdminCard.jsx
    AdminMetricCard.jsx
    AdminModal.jsx
    AdminSidebar.jsx
    AdminStatusBadge.jsx
    AdminTable.jsx
    modules/
      DashboardModule.jsx
      UsersModule.jsx
      CoursesModule.jsx
      CommunicationModule.jsx
      AnalyticsModule.jsx
      SecurityModule.jsx
      SettingsModule.jsx
  hooks/
    useAdminAccess.js
    useAdminPortal.js
  pages/admin/
    AdminRoute.jsx
    AdminPortal.jsx
  services/api/
    adminService.js
```

## Backend Structure

```text
backend/src/
  controllers/
    admin.controller.js
  middlewares/
    auth.middleware.js
    role.middleware.js
  models/
    AuditLog.js
    ApiErrorLog.js
    Category.js
    LoginActivity.js
    School.js
  routes/
    admin.routes.js
  services/
    admin-log.service.js
```
