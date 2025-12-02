const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prismaClient');

// Generate JWT tokens
const generateTokens = (user, extraData = {}) => {
  const payload = {
    id: user.id,       // userId
    email: user.email,
    role: user.role,
    ...extraData       // patientId or doctorId
  };

  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};
// 🟢 SIGNUP Controller
// SIGNUP Controller (Fully Corrected)
exports.signup = async (req, res) => {
  try {
    let {
      name,
      email,
      password,
      role,
      specialization,
      licenseNo,
      dob,
      gender,
      bloodGroup,
      medicalNotes
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Convert role to uppercase (backend expects ADMIN/DOCTOR/PATIENT)
    role = role?.toUpperCase() || "PATIENT";

    // Check user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create main User
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    });

    // FIX: Convert empty strings to null
    specialization = specialization?.trim() || null;
    licenseNo = licenseNo?.trim() || null;
    gender = gender?.trim() || null;
    bloodGroup = bloodGroup?.trim() || null;
    medicalNotes = medicalNotes?.trim() || null;

    // FIX: Handle DOB properly
    dob = dob ? new Date(dob) : null;

    // Create Doctor or Patient
    if (role === "DOCTOR") {
      await prisma.doctor.create({
        data: {
          userId: newUser.id,
          specialization,
          licenseNo
        }
      });
    }

    if (role === "PATIENT") {
      await prisma.patient.create({
        data: {
          userId: newUser.id,
          dob,
          gender,
          bloodGroup,
          medicalNotes
        }
      });
    }

    // Generate Tokens
    const { accessToken, refreshToken } = generateTokens(newUser);

    return res.status(201).json({
      message: "Signup successful",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      tokens: { accessToken, refreshToken }
    });

  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Server error during signup" });
  }
};


// 🟡 LOGIN
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid credentials" });

    // Fetch linked doctor / patient ID
    let linkedIds = {};

    if (user.role === "DOCTOR") {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: user.id },
      });
      linkedIds.doctorId = doctor?.id;
    }

    if (user.role === "PATIENT") {
      const patient = await prisma.patient.findUnique({
        where: { userId: user.id },
      });
      linkedIds.patientId = patient?.id;
    }

    // Generate tokens with doctorId/patientId inside JWT
    const tokens = generateTokens(user, linkedIds);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...linkedIds, // return doctorId or patientId
      },
      ...tokens,
    });

  } catch (err) {
    console.error("Login Error:", err);
    next(err);
  }
};

// 🔁 REFRESH TOKEN
exports.refresh = (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken)
      return res.status(401).json({ message: 'Refresh token required' });

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      (err, decoded) => {
        if (err)
          return res.status(403).json({ message: 'Invalid or expired token' });

        const accessToken = jwt.sign(
          { id: decoded.id, role: decoded.role, email: decoded.email },
          process.env.JWT_ACCESS_SECRET,
          { expiresIn: '15m' }
        );

        res.status(200).json({ accessToken });
      }
    );
  } catch (err) {
    console.error('Refresh Token Error:', err);
    next(err);
  }
};

// 🔴 LOGOUT
exports.logout = async (req, res, next) => {
  try {
    // We can later add a token blacklist system here if needed
    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    console.error('Logout Error:', err);
    next(err);
  }
};
