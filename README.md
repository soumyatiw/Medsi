# Medsi – Patient Prescription & Appointment Management System**

A complete medical management system for doctors, patients, and administrators.
Medsi provides a centralized way to manage appointments, prescriptions, reports, and health records — with secure authentication and role-based access.

**🚀 Tech Stack**

Frontend: Next.js, React, CSS module

Backend: Node.js, Express.js

Database: MongoDB Atlas

ORM: Prisma ORM

Auth: JWT (Access + Refresh tokens), bcrypt

Hosting:

Frontend: Vercel
https://medsi-soumya.vercel.app/login

Backend: Render
https://medsi.onrender.com

Database: MongoDB Atlas (Cloud)

**🏗 System Architecture**
Next.js (Frontend)
        ↓
Express.js API (Backend)
        ↓
MongoDB Atlas (Database, via Prisma ORM)

**⭐ Features**
🔐 Authentication & Authorization

JWT-based authentication

Access & refresh tokens

Role-based access control

Admin

Doctor

Patient

**🧑‍⚕️ Doctor:**

View & manage patients

Create/update prescriptions

Create/update appointments

Upload medical reports

View patient medical history

**🧑 Patient:**

View prescriptions and reports

Book, reschedule or cancel appointments

View medical history

Update profile details

**🛠 Admin:**

Manage users (doctor/patient)

Approve doctor registrations

View system statistics

Access all records

Ensure password is URL encoded.

🗄 MongoDB-Compatible Prisma Schema

Prisma’s MongoDB schema is different from MySQL — IDs use String @db.ObjectId.

If you want, I can insert your full schema here as well. (Say: “add schema to README”.)

🧪 Running the Backend Locally
1️⃣ Install dependencies
npm install

2️⃣ Generate Prisma client
npx prisma generate

3️⃣ Push schema to MongoDB
npx prisma db push

4️⃣ Start server
npm run dev


Server runs on:
👉 http://localhost:8080

🌱 Seeding the Database

Run:

npm run seed


This creates:

Admin → admin@medsi.com

Doctor → doctor@medsi.com

Patient → patient@medsi.com

Password for all → 123456

**📡 Deployment**
🟣 Backend (Render)
DEPLOYED LINK : https://medsi.onrender.com

Upload repo to GitHub

Create Render Web Service

Add .env variables

Build Command:

npm install && npx prisma generate


Start Command:

npm start

**🟣 Frontend (Vercel)**
DEPLOYED LINK : https://medsi-soumya.vercel.app

Connect GitHub repo

Add env:

NEXT_PUBLIC_API_URL = https://medsi.onrender.com


Deploy

**📘 API Overview**
Auth
Method	Endpoint	Description
POST	/api/auth/signup	Register
POST	/api/auth/login	Login
POST	/api/auth/refresh	Refresh token
POST	/api/auth/logout	Logout
*Patient*

/api/patient/profile

/api/patient/appointments

/api/patient/prescriptions

/api/patient/reports

*Doctor*

/api/doctor/patients

/api/doctor/appointments

/api/doctor/prescriptions

/api/doctor/reports

*Admin*

/api/admin/users

/api/admin/approve-doctor/:id

/api/admin/stats

*🧑‍💻 Author*

Soumya Tiwari
B.Tech CSE (Data Science), Newton School of Technology
Developer of Medsi – 2025

*📜 License*

This project is licensed under the MIT License.
