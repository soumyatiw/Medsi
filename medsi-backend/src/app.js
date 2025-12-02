const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const patientBookingRoutes = require("./routes/patientBookingRoutes");


const errorHandler = require('./middleware/errorHandler');

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:3000",                     // local frontend during development
    "https://medsi-soumya.vercel.app"      // replace after you deploy frontend
  ],
  methods: "GET,POST,PUT,DELETE",
  credentials: true,                             // allow cookies & auth headers
};
app.use(cors(corsOptions));

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);
app.use("/api/doctor/slots", require("./routes/doctorSlotRoutes"));
app.use("/api/patient", patientBookingRoutes);

// health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Error handler (last)
app.use(errorHandler);

module.exports = app;
