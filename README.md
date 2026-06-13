# LearnHub LMS

LearnHub is a complete modern Learning Management System starter with a Next.js 14 App Router frontend and a TypeScript Express REST API backed by MySQL and Prisma. It includes role-based workflows for Super Admin, Admin, Instructor, and Student accounts.

## Tech Stack

- Frontend: Next.js 14, React, TypeScript, Tailwind CSS, ShadCN-style local UI components, Axios, TanStack Query, next-themes, lucide-react
- Backend: Node.js, Express, TypeScript, Prisma ORM, MySQL, JWT, bcrypt, Multer, Nodemailer, Helmet, CORS, rate limiting
- Database: MySQL relational schema with seed data and Prisma migrations

## Features

- Authentication: register, login, logout, JWT access token, refresh token storage, forgot/reset password, email verification, profile update, password change
- Role-based access: Super Admin, Admin, Instructor, Student
- Admin: dashboards, users, courses, reports, analytics, settings, instructor approval-ready statuses
- Instructor: course creation, curriculum APIs, quizzes, assignments, submissions, students, earnings placeholder
- Student: course catalog, enrollment, learning player, progress tracking, assignments, quizzes, certificates, profile
- LMS modules: categories, sections, lessons, payments, reviews, notifications, discussions, certificates
- Security: password hashing, validation, rate limiting, secure headers, CORS, ORM protection, upload validation, environment variables

## Folder Structure

```txt
backend/
  prisma/schema.prisma
  prisma/seed.ts
  src/config
  src/controllers
  src/middlewares
  src/routes
  src/services
  src/utils
  src/validators
  src/server.ts
frontend/
  app/
  components/ui
  components/layout
  components/course
  components/dashboard
  lib/
```

## Installation

Install dependencies in each app:

```bash
cd backend
npm install
cp .env.example .env
```

Update `backend/.env` with your local MySQL connection:

```env
DATABASE_URL="mysql://root:password@localhost:3306/learnhub"
JWT_ACCESS_SECRET=replace-with-a-long-random-access-secret
JWT_REFRESH_SECRET=replace-with-a-long-random-refresh-secret
FRONTEND_URL=http://localhost:3000
```

Create the database, run migrations, and seed:

```bash
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

In another terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open:

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:5000/health`

## Default Login Credentials

Super Admin:

- Email: `admin@lms.com`
- Password: `Admin@123`

Instructor:

- Email: `instructor@lms.com`
- Password: `Instructor@123`

Student:

- Email: `student@lms.com`
- Password: `Student@123`

## API Documentation

Base URL: `http://localhost:5000/api`

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `PATCH /api/auth/change-password`

Users:

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `GET /api/users/:id/activity`

Courses and content:

- `GET /api/courses`
- `GET /api/courses/:slug`
- `POST /api/courses`
- `PUT /api/courses/:id`
- `DELETE /api/courses/:id`
- `PATCH /api/courses/:id/publish`
- `POST /api/sections`
- `POST /api/lessons`

Learning:

- `POST /api/enrollments`
- `GET /api/enrollments/my-courses`
- `GET /api/enrollments/course/:courseId`
- `POST /api/progress/complete-lesson`
- `GET /api/progress/:courseId`

Assessments:

- `POST /api/quizzes`
- `GET /api/quizzes/course/:courseId`
- `POST /api/quizzes/:quizId/attempt`
- `POST /api/quizzes/:quizId/submit`
- `POST /api/assignments`
- `GET /api/assignments/course/:courseId`
- `POST /api/assignments/:assignmentId/submit`
- `PATCH /api/assignments/submissions/:submissionId/grade`

Other modules:

- `POST /api/payments`
- `GET /api/payments`
- `GET /api/certificates/my-certificates`
- `GET /api/certificates/verify/:certificateCode`
- `POST /api/certificates/generate`
- `GET /api/reviews`
- `POST /api/reviews`
- `GET /api/notifications`
- `GET /api/discussions/course/:courseId`
- `POST /api/discussions`
- `GET /api/settings`
- `PUT /api/settings`
- `GET /api/analytics`

Import `backend/learnhub.postman_collection.json` into Postman for sample requests.

## Frontend Pages

Public:

- `/`
- `/courses`
- `/courses/[slug]`
- `/about`
- `/contact`
- `/login`
- `/register`
- `/forgot-password`
- `/certificate/verify`

Dashboards:

- `/admin`
- `/admin/users`
- `/admin/courses`
- `/admin/reports`
- `/admin/settings`
- `/instructor`
- `/instructor/courses`
- `/instructor/courses/new`
- `/instructor/students`
- `/instructor/submissions`
- `/instructor/earnings`
- `/student`
- `/student/learning`
- `/student/assignments`
- `/student/certificates`
- `/student/profile`
- `/learn/[courseId]`

## Future Improvements

- Add Stripe, PayHere, or Razorpay provider implementation behind the payment placeholder.
- Add PDF rendering for downloadable certificates.
- Add real chart components for analytics.
- Add Redis caching and background jobs for scheduled assignment reminders.
- Add end-to-end tests for the core learning flow.
