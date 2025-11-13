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
