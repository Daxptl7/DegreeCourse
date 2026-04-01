# 🎓 UniLearn PDEU

**UniLearn PDEU** is a comprehensive, full-stack Learning Management System (LMS) designed specifically for university environments, inspiring a seamless educational bridge between students and teachers. Taking cues from modern platforms like MS Teams and Udemy, UniLearn provides a robust environment for course delivery, video streaming, interactive assignments, and class communication.

---

## ✨ Key Features

### 👨‍🏫 For Teachers
- **Course Creation & Management:** Create structured courses with modular parts and lectures.
- **Assignment System (MS Teams-style):** Create, distribute, and collect assignments with file attachments and strict due dates.
- **Submissions Review:** View, download, and track assignment submissions from enrolled students.
- **Class Announcements:** Broadcast updates, news, and critical information to all enrolled students with read receipts.
- **Q&A Dashboard:** Answer student doubts and foster an interactive learning environment.
- **Rich Media Support:** Upload instructional videos or embed standard YouTube course materials.

### 👨‍🎓 For Students
- **Course Marketplace & Cart:** Browse available courses, view previews, and enroll using a streamlined cart system.
- **Immersive Video Player:** Watch course lectures with built-in progress tracking (completed/pending indicators).
- **Assignments Workflow:** Upload and turn in assignment files before deadlines, tracking submission status.
- **Interactive Q&A:** Post questions directly on course pages, attach screenshots, and get answers from the instructor.
- **Announcements Feed:** Stay up-to-date with course updates through the dedicated announcements tab.

---

## 🛠️ Technology Stack

**Frontend:**
- **React.js** - UI Library (Hooks, Context API for state management)
- **React Router** - Single Page Application navigation
- **Lucide React** - Modern, clean SVG icon pack
- **Vanilla CSS** - Custom, responsive styling (no heavy UI frameworks)

**Backend:**
- **Node.js & Express.js** - Fast, unopinionated web framework
- **MongoDB & Mongoose** - NoSQL database for flexible, scalable schema management
- **JWT (JSON Web Tokens)** - Secure, stateless user authentication and role authorization
- **Multer** - Middleware for handling `multipart/form-data` (Video, Document, and Image uploads)

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas cluster)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd UnilearnPDEU
```

### 2. Backend Setup
```bash
cd backend
npm install
```
- Create a `.env` file in the `backend` directory tracking `.env.example`.
- Ensure you have the following variables set:
  - `PORT=5000`
  - `MONGODB_URI=<your-mongodb-connection-string>`
  - `JWT_SECRET=<your-secure-secret>`
- Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
- Start the React development server:
```bash
npm run dev
# or npm start depending on your scripts
```

The frontend will run on `http://localhost:5173` (or `3000`), and the API will be accessible at `http://localhost:5000/api`.

---

## 🗄️ Database Schema Overview

- **User:** Stores profile information, role (`student`, `teacher`, `admin`), and authentication creds.
- **Course:** Holds course metadata, thumbnails, parts, and individual video lectures.
- **Enrollment:** Links a Student to a Course and tracks their lecture progression.
- **Assignment & Submission:** Powers the MS Teams-like homework feature linking teachers, students, files, and strict deadlines.
- **Announcement:** Broadcasts messages from teachers to enrolled students.
- **Question:** Threaded Q&A model linking student questions, optional images, and teacher responses.

---

## 🔮 Future Roadmap (Coming Soon)
- **Advanced Grading & Rubrics:** Configure points and rubrics for assignments.
- **Plagiarism Detection:** Basic similarity scoring on assignment submissions.
- **Real-time Notifications:** WebSockets for instant PUSH notifications on grades, announcements, and messages.
- **Analytics Dashboard:** Visual representation of class performance and engagement for teachers.

---

*Built for education. Built for PDEU.*