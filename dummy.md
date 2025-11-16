BACKEND FOLDER


medsi-backend/
├─ .env
├─ .env.example
├─ .gitignore
├─ package.json
├─ prisma/
│  ├─ schema.prisma
│  ├─ seed.js
├─ src/
│  ├─ server.js                <-- starts server
│  ├─ app.js                   <-- express app, middleware
│  ├─ config/
│  │  ├─ prismaClient.js
│  │  ├─ cloudinary.js
│  │  └─ logger.js
│  ├─ middleware/
│  │  ├─ authMiddleware.js
│  │  ├─ roleMiddleware.js
│  │  ├─ errorHandler.js
│  │  └─ uploadMiddleware.js
│  ├─ routes/
│  │  ├─ authRoutes.js
│  │  ├─ adminRoutes.js
│  │  ├─ doctorRoutes.js
│  │  └─ patientRoutes.js
│  ├─ controllers/
│  │  ├─ authController.js
│  │  ├─ adminController.js
│  │  ├─ doctorController.js
│  │  └─ patientController.js
│  ├─ services/
│  │  ├─ authService.js
│  │  ├─ userService.js
│  │  └─ appointmentService.js
│  ├─ utils/
│  │  ├─ jwt.js
│  │  ├─ validators.js
│  │  └─ helpers.js
│  └─ uploads/                  <-- local uploads (dev) - ignored from git
├─ README.md





-------------=-=-=-=FRONTEND FOLDER


medsi-frontend/
│
├── public/
│   ├── logo.png
│   ├── images/                 # hero images, dashboard illustrations
│   └── icons/                  # SVG icons for nav + dashboard
│
├── src/
│   ├── pages/
│   │   ├── index.js            # homepage (not logged in)
│   │   ├── login.js
│   │   ├── signup.js
│   │   │
│   │   ├── patient/
│   │   │   ├── index.js        # dashboard
│   │   │   ├── appointments.js
│   │   │   ├── prescriptions.js
│   │   │   └── profile.js
│   │   │
│   │   ├── doctor/
│   │   │   ├── index.js
│   │   │   ├── patients.js
│   │   │   ├── appointments.js
│   │   │   ├── prescriptions.js
│   │   │   └── reports.js
│   │   │
│   │   ├── admin/
│   │   │   ├── index.js
│   │   │   ├── users.js
│   │   │   └── doctors.js
│   │   │
│   │   ├── _app.js              # wraps entire app with AuthContext
│   │   ├── _document.js
│   │   └── 404.js
│   │
│   ├── components/
│   │   ├── Home/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Navbar.module.css
│   │   │   ├── Hero.jsx
│   │   │   ├── Hero.module.css
│   │   │   ├── Features.jsx
│   │   │   ├── Features.module.css
│   │   │   ├── About.jsx
│   │   │   ├── About.module.css
│   │   │   ├── Footer.jsx
│   │   │   └── Footer.module.css
│   │   │
│   │   ├── Dashboard/
│   │   │   ├── NavbarPatient.jsx
│   │   │   ├── NavbarDoctor.jsx
│   │   │   └── NavbarAdmin.jsx
│   │   │
│   │   ├── Common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   └── Loader.jsx
│   │   │
│   │   └── Cards/
│   │       ├── AppointmentCard.jsx
│   │       ├── PrescriptionCard.jsx
│   │       └── UserCard.jsx
│   │
│   ├── api/
│   │   ├── axiosInstance.js
│   │   ├── auth.js
│   │   ├── patient.js
│   │   ├── doctor.js
│   │   └── admin.js
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │   └── useAuth.js
│   │
│   ├── utils/
│   │   ├── authUtils.js
│   │   ├── protectedRoute.js
│   │   └── constants.js
│   │
│   ├── lib/
│   │   └── storage.js            # handles token storage
│   │
│   └── styles/
│       ├── globals.css
│       ├── variables.css
│       └── reset.css
│
├── .env.local
├── package.json
├── next.config.js
└── jsconfig.json
