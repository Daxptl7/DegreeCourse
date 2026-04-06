# Student Section Functional Features

## 1. Purpose of This Document

This document explains the currently implemented functional features available in the Student Section of the UniLearn PDEU project.

The document is intentionally limited to student-side functionality only. Teacher-side features are not included.

Only features that are clearly represented in the current student workflow have been included. Placeholder or non-functional UI items have been intentionally excluded so that this document remains accurate and suitable for formal submission.

## 2. Student Module Overview

The Student Section of UniLearn PDEU is designed to support the complete learner journey on the platform, starting from account creation and course discovery and continuing through enrollment, content consumption, assignment submission, doubt resolution, announcements, live classes, and profile management.

At present, the student module supports these major functional areas:

- Student registration and login
- Personalized home and course discovery
- Course catalog browsing
- Course detail access and enrollment-based learning access
- My Courses and enrolled course tracking
- Lecture progress tracking
- Assignment viewing and submission
- Announcement reading and unread tracking
- Question and answer participation
- Live class joining
- Cart management
- Student profile management

## 3. Student Access and Account Creation

The system provides a dedicated student entry flow through the main authentication pages.

The student account process currently supports:

- New user registration
- Role selection during registration
- Student school selection during registration
- Email and password login
- Session persistence through authenticated user context

During registration, the student provides:

- Name
- Email
- Phone number
- Password
- Role
- School

The school field is important because the platform uses it to personalize student course visibility and recommendations.

## 4. Student Navigation Structure

The student interface uses the main application navigation bar.

The currently available student navigation areas are:

- Home
- Courses
- My Courses
- My Cart
- Profile

This gives the student direct access to course discovery, enrolled learning, saved cart items, and personal account management.

## 5. Home Page and Personalized Recommendations

The student home page acts as the main starting point after login.

Its current functions include:

- Displaying the main platform landing section
- Showing a recommended or trending course carousel
- Personalizing recommendations based on the student's school where available
- Allowing direct navigation from recommendation cards to course detail pages

If a logged-in student has a school assigned, the recommendation list is filtered to match that school category. This creates a school-aware discovery experience rather than a generic catalog-only view.

## 6. Course Catalog Browsing

The student can browse available courses through the main Courses page.

The course catalog currently supports:

- Viewing approved public courses
- Searching courses by text
- Filtering by category
- Sorting courses by newest, oldest, rating, and price
- Pagination across the course list
- Viewing course cards with title, instructor, price, and rating
- Opening a specific course detail page

For logged-in students with an assigned school, the catalog applies school-based filtering so that the student view remains aligned with the appropriate academic category.

This page serves as the main discovery and exploration area for students.

## 7. Course Detail Page

The Course Detail page is the main student learning page for an individual course.

Before or after enrollment, the page currently provides:

- Course title and main course media area
- Instructor identity display
- Course description
- Category information
- Difficulty information
- Duration information
- Learning outcomes list
- Structured course content view with parts and lectures
- Related course suggestions

The course page is also the main entry point for the learning tabs:

- Videos
- Announcements
- Assignments
- Q and A

This makes the course detail page the central workspace for an enrolled student.

## 8. Enrollment and Learning Access Control

The project currently distinguishes between pre-enrollment viewing and enrolled learning access.

The current enrollment-related behavior includes:

- A student can open course details before enrollment
- A student can enroll directly from the course page
- After successful enrollment, the student gets learning access to the course
- The system prevents duplicate enrollment
- The system prevents a teacher from enrolling in their own course

Once enrolled, the student gains access to:

- Lecture completion tracking
- Announcements
- Assignments
- Q and A content
- Learning progress records for that course

This ensures that learning tools are connected to actual course enrollment.

## 9. Video Learning and Lecture Progress

The Videos tab in the course page supports lecture-based learning.

The current video-learning functionality includes:

- Viewing the course content structure by part and lecture
- Expanding or collapsing course parts
- Selecting a lecture for playback
- Playing uploaded course videos
- Playing linked embedded video content when available
- Viewing lecture titles and duration
- Distinguishing locked content from accessible content
- Marking a lecture as completed
- Toggling lecture completion status
- Tracking total course completion percentage

For enrolled students, the system stores lecture progress per course and calculates percentage completion based on completed lectures.

This creates a structured self-paced learning workflow rather than only video playback.

## 10. Announcements Access

The Announcements tab allows students to view instructor updates for an enrolled course.

The current announcement functionality includes:

- Viewing all announcements for the course
- Reading announcement title and message
- Viewing announcement date
- Seeing whether an announcement is new or already read
- Marking announcements as read through interaction

The student dashboard for enrolled courses also shows unread announcement counts per course, allowing students to notice new course updates quickly from the My Courses area.

This supports timely academic communication between instructor and learner.

## 11. Assignment Viewing and Submission

The Assignments tab allows students to interact with course assignments after enrollment.

The current assignment functionality includes:

- Viewing all assignments for the selected course
- Reading assignment title and description
- Viewing assignment due date and time
- Downloading assignment resources attached by the instructor
- Uploading a submission file
- Saving an assignment as draft
- Turning in an assignment formally
- Viewing the student's previously uploaded submission file
- Viewing submission status
- Viewing graded status where applicable
- Viewing grade and instructor feedback after grading

The assignment workflow currently distinguishes between these submission states:

- Draft
- Submitted
- Graded

This gives the student a complete coursework submission flow instead of only assignment viewing.

## 12. Q and A and Doubt Resolution

The Q and A tab supports student doubt posting and discussion viewing for an enrolled course.

The current Q and A functionality includes:

- Viewing all questions raised for the course
- Viewing question title, description, status, and date
- Expanding a question to view full discussion
- Viewing teacher and student replies
- Identifying teacher replies clearly in the answer thread
- Asking a new question through a modal form
- Adding a screenshot or image while posting a question

Question status is also visible to the student so that doubts can be understood as open or completed.

This feature supports academic clarification and course-level interaction inside the same learning environment.

## 13. My Courses Section

The My Courses page acts as the student's enrolled-learning dashboard.

Its current functions include:

- Viewing all enrolled courses
- Opening a course directly from the enrolled list
- Seeing course cards in a dedicated learning view
- Viewing instructor information for each enrolled course
- Seeing unread announcement badges for relevant courses
- Continuing learning by opening the selected course

This gives the student a single location for returning to active courses after enrollment.

## 14. Live Class Joining

The student module supports joining live sessions through the My Courses area.

The current live-class joining workflow includes:

- Opening the Join Live Class dialog
- Entering a meeting code shared by the instructor
- Checking whether the live session is active
- Navigating into the live classroom when a valid active session exists

Once inside the live class screen, the current student-side experience includes:

- Real-time audio and video participation
- Real-time chat participation
- Presence in the session room through socket-based communication

For course-linked sessions, the backend also checks course-related access conditions when the user joins the session.

## 15. Cart Management

The project includes a dedicated student cart module.

The current cart functionality includes:

- Viewing courses currently present in the student's cart
- Seeing course thumbnail, title, instructor, and price
- Removing a course from the cart
- Enrolling directly from the cart

After successful enrollment from the cart:

- The course is removed from the cart
- The course becomes part of the student's enrolled course list

This gives the student a holding area for courses before joining them fully.

## 16. Student Profile Management

The student profile page provides a personal account dashboard.

The current profile functionality includes:

- Viewing student name and email
- Viewing role information
- Viewing selected school
- Viewing user ID or person ID
- Viewing enrolled course count
- Uploading or changing profile picture
- Viewing saved social links
- Editing social links

The currently supported editable social links are:

- LinkedIn
- GitHub
- Instagram

This allows the student to maintain a personal academic profile inside the platform.

## 17. Student Workflow Summary

The current end-to-end student workflow in the project can be summarized as follows:

1. The student registers and logs into the platform.
2. The student sees personalized recommendations on the home page.
3. The student browses the course catalog using search, filters, sorting, and pagination.
4. The student opens a course detail page to study the course structure and information.
5. The student enrolls in a selected course.
6. The student watches lectures and tracks completion progress.
7. The student checks announcements, assignments, and Q and A inside the course.
8. The student submits assignments and later views grades or feedback when available.
9. The student uses My Courses to continue learning and monitor unread updates.
10. The student joins live classes using the instructor-shared meeting code.
11. The student manages account information from the profile page.

## 18. Conclusion

The Student Section of UniLearn PDEU currently provides a structured learner-facing environment that supports course discovery, school-aware personalization, enrollment, lecture consumption, progress tracking, assignment submission, announcement reading, question posting, live class participation, cart handling, and profile management.

In its current state, the student module covers the major day-to-day functional needs of a learner within the platform.
