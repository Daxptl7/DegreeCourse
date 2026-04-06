# Teacher Section Functional Features

## 1. Purpose of This Document

This document explains the currently implemented functional features available in the Teacher Section of the UniLearn PDEU project.

The document is intentionally limited to teacher-side functionality only. Student-side features are not included.

Only features that are clearly represented in the current teacher workflow have been included. Placeholder items and incomplete UI elements have been intentionally excluded to keep this document accurate and submission-ready.

## 2. Teacher Module Overview

The Teacher Section of UniLearn PDEU is designed to help a teacher perform the main academic and course-management activities required on the platform.

At present, the teacher module supports these major functional areas:

- Teacher access and account entry
- Teacher dashboard
- Course creation and course management
- Section and lecture management
- Live class initiation
- Question and answer management
- Assignment management
- Announcement management
- Teacher analytics and statistics

## 3. Teacher Access and Entry

The system provides a dedicated entry flow for teachers.

- A teacher-specific landing page is available to guide instructors into the teaching module.
- A teacher can register by providing basic details such as name, email, password, and phone number.
- After authentication, teacher operations are handled through teacher-authorized APIs.
- Backend role validation is applied so that teacher-only operations are restricted to teacher or admin accounts where applicable.

This ensures that the teacher area is functionally separated from the student experience.

## 4. Teacher Dashboard

The Teacher Dashboard acts as the main working area for an instructor after entering the teacher section.

Its main functional responsibilities are:

- Displaying a personalized welcome view for the logged-in teacher
- Showing high-level teaching statistics
- Providing quick navigation to key teacher tasks
- Showing a short list of recently created or managed courses

The dashboard currently shows the following summary indicators:

- Total number of courses created by the teacher
- Total number of enrolled students across the teacher's courses
- Total number of reviews received across the teacher's courses
- Average rating across rated courses

The dashboard also provides direct action links to:

- Create Course
- My Courses
- Communication
- Assignments
- Announcements

This makes the dashboard the central control panel of the teacher section.

## 5. Course Creation

Teachers can create a new course from the teacher module.

The course creation form currently supports the following inputs:

- Course name
- Subtitle
- Detailed description
- Price
- Category
- Duration
- Thumbnail URL
- Learning outcomes

The course identifier used internally for the course page is generated automatically from the course name at the time of creation.

After successful creation:

- The course is stored under the current teacher account
- The teacher is redirected to the course management page
- The course becomes available for further content structuring

This feature allows the teacher to initialize a complete course record directly from the interface.

## 6. My Courses

The My Courses area is the teacher's course inventory page.

Its current functions include:

- Viewing all courses created by the teacher
- Displaying each course in card format
- Showing basic course details such as title, status, and price
- Opening an individual course for management
- Providing a direct shortcut to create another course

This page gives the teacher a single place to review and manage all owned courses.

## 7. Course Management

Once a course is created, the teacher can open its management page and organize its teaching content.

The course management area currently supports the following functions:

- Viewing the course cover image and course title
- Viewing the full section-wise structure of the course
- Expanding or collapsing sections
- Opening lecture preview inside the management screen
- Accessing the create menu for additional actions

This screen works as the main operational page for managing the academic structure of a course.

## 8. Section Management

Teachers can divide a course into structured sections.

The current section management functionality includes:

- Adding a new section to an existing course
- Giving each section a title
- Automatically placing the new section into the course structure
- Viewing the number of lectures inside each section

This supports modular organization of course content.

## 9. Lecture Management

Teachers can add lecture content inside a selected section.

The lecture creation workflow currently supports:

- Lecture title
- Video file upload
- Duration
- Description
- Summary
- Thumbnail URL
- Notes or resource link

After submission:

- The lecture is added to the selected section
- The course structure refreshes immediately in the teacher view
- The lecture can be previewed from the same management screen

The preview system supports playback of stored course videos and can also display embedded video links already associated with a lecture record.

## 10. Live Class Initiation

The teacher can start a live class directly from the course management page.

The current live-class workflow includes:

- Generating a unique meeting code
- Displaying the meeting code in a popup
- Copying the code for sharing
- Starting the live session from the teacher interface

After the session starts:

- The teacher is redirected to the live classroom screen
- Real-time audio and video communication is supported
- Real-time chat is supported inside the live session
- Room participation is tracked through socket connections

For course-linked live sessions, the backend also checks access conditions so that course participation can be controlled based on user role and enrollment.

## 11. Communication Module: Q and A Management

The teacher communication area includes a dedicated Q and A interface for handling student questions.

The teacher can currently:

- Select one of their courses from a dropdown
- Load all questions related to that course
- Filter questions by status: all, open, or completed
- Expand a question to view complete details
- View the student's name, email, and date of posting
- View question description and attached image if available
- Reply directly inside the discussion thread
- Mark a question as completed
- Re-open a completed question

This allows the teacher to manage course-level doubt resolution in a structured and trackable way.

## 12. Assignment Management

The teacher assignments area supports creation and monitoring of course assignments.

The assignment creation workflow currently supports:

- Selecting a course
- Entering assignment title
- Entering assignment description
- Setting a due date and time
- Uploading an optional assignment file

After creation, the teacher can:

- View the list of assignments for the selected course
- See due dates clearly
- Open attached assignment files
- Open the submissions view for a selected assignment

Inside the submissions view, the teacher can:

- View all received submissions for that assignment
- See student name and email
- See submission date and time
- Search submissions by student name or email
- Access submitted files directly

This provides a complete teacher-side assignment review workflow up to submission access and tracking.

## 13. Announcement Management

The teacher announcement area allows instructors to publish and manage official course updates.

The current announcement workflow supports:

- Selecting a course
- Entering announcement title
- Entering announcement content
- Posting a new announcement
- Viewing recent announcements for the selected course
- Editing an existing announcement
- Deleting an announcement

Additional functional behavior includes:

- New announcements are displayed immediately in the teacher list
- Edited announcements are updated in place
- Deleted announcements are removed from the visible list
- Timestamps are shown for posted announcements

This module supports formal teacher-to-class communication from a single interface.

## 14. Teacher Statistics and Analytics

The teacher statistics page provides a visual summary of teaching activity and course performance.

The current analytics module includes:

- Overall total courses
- Overall total enrolled students
- Overall total reviews
- Overall average rating

It also includes chart-based analysis such as:

- Bar chart for enrollments and reviews per course
- Line chart for rating distribution across courses
- Pie chart for course status breakdown

This enables the teacher to monitor academic engagement and course-level performance through a visual dashboard rather than only raw numbers.

## 15. Teacher Navigation Structure

The teacher module uses a dedicated sidebar-based navigation structure.

The main available navigation areas are:

- Dashboard
- Courses
- Communication
- Statistics

Within the communication area, the teacher can move between:

- Q and A
- Assignments
- Announcements

This creates a clear separation between teaching operations, course content management, and performance tracking.

## 16. Functional Workflow Summary

The current end-to-end teacher workflow in the project can be summarized as follows:

1. The teacher enters the teacher module and signs up or logs in.
2. The teacher opens the dashboard to view summary information and shortcuts.
3. The teacher creates a new course.
4. The teacher adds sections and lecture content to build the course structure.
5. The teacher can start a live class for the course when needed.
6. The teacher handles student questions through the Q and A interface.
7. The teacher creates assignments and reviews student submissions.
8. The teacher posts and manages announcements for each course.
9. The teacher monitors engagement and performance through the statistics page.

## 17. Conclusion

The Teacher Section of UniLearn PDEU currently provides a structured digital teaching workspace that supports course creation, content organization, live teaching, academic communication, assignment monitoring, announcements, and performance analytics.

In its current state, the teacher module already covers the major day-to-day functional needs of an instructor within the platform.
