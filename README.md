# Medsi — Healthcare Management Platform

Medsi is a full-stack healthcare web application that connects doctors and patients. Doctors can manage their patients, appointments, and time slots. Patients can book appointments, view prescriptions, and track their health records — all from one clean dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (Pages Router), Vanilla CSS Modules |
| Backend | Node.js, Express.js |
| Database | MongoDB with Prisma ORM |
| Auth | JWT (Access + Refresh Tokens) |

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd Medsi
```

### 2. Start the backend

```bash
cd medsi-backend
npm install
npm run dev
```

Runs on `http://localhost:5000`

### 3. Start the frontend

```bash
cd medsi-frontend
npm install
npm run dev
```

Runs on `http://localhost:3000`

---

## Demo Credentials

### Doctor
| Field | Value |
|---|---|
| Email | `doctor@email.com` |
| Password | `123456` |

### Patient
| Field | Value |
|---|---|
| Email | `test@email.com` |
| Password | `123456` |

---

## Doctor Role

After logging in as a doctor, you can:

### Patients
- View all linked patients in a paginated table
- Search patients by name or email
- Create a new patient account directly (auto-linked to you)
- Link an existing patient by email
- Edit patient details (name, DOB, gender, blood group, medical notes)
- Unlink a patient from within the Edit modal

### Appointments
- View all appointments with status badges (Upcoming / Completed / Cancelled)
- Filter by status or search by patient name/email
- Change appointment status via an inline dropdown
- Select multiple appointments and bulk delete
- Add prescriptions directly from an appointment

### Slots
- View all created time slots with their status (Available / Booked / Expired)
- Create new slots by selecting a start and end time
- Select multiple slots and bulk delete them

### Prescriptions
- Add diagnosis, medicines, and notes to completed or upcoming appointments
- Prescriptions become visible to the linked patient immediately

---

## Patient Role

After logging in as a patient, you can:

### Dashboard
- See total appointments, prescriptions, and reports at a glance
- View the next upcoming appointment with doctor details
- Quick access to recent prescriptions and uploaded reports

### Book Appointment
- Browse available doctors
- View open time slots for a selected doctor
- Confirm and book an appointment

### Appointments
- View all past and upcoming appointments
- Cancel an upcoming appointment
- Select multiple appointments and bulk delete
- In-app notifications for all actions (no browser popups)

### Prescriptions
- View all prescriptions issued by doctors
- Each card shows the doctor, diagnosis, and a preview of medicines prescribed
- Click any prescription to view the full detail — including numbered medicine list, diagnosis, and doctor's notes

---

## Project Structure

```
Medsi/
├── medsi-backend/       # Express API server
│   └── src/
│       ├── controllers/ # Business logic
│       ├── routes/      # API route definitions
│       ├── middleware/   # Auth, role guards
│       └── app.js
│
└── medsi-frontend/      # Next.js client
    └── src/
        ├── pages/       # Route pages (doctor/, patient/)
        ├── components/  # Shared UI components
        ├── styles/      # CSS Modules
        └── api/         # Axios instance
```
