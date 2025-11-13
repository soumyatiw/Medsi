const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prismaClient');

// Generate JWT tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// 🟢 SIGNUP Controller
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, specialization, licenseNo, dob, gender, bloodGroup, medicalNotes } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create base user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'PATIENT',
      },
    });

    // Create related Doctor or Patient record based on role
    if (newUser.role === 'DOCTOR') {
      await prisma.doctor.create({
        data: {
          userId: newUser.id,
          specialization,
          licenseNo,
        },
      });
    } else if (newUser.role === 'PATIENT') {
      await prisma.patient.create({
        data: {
          userId: newUser.id,
          dob: dob ? new Date(dob) : null,
          gender,
          bloodGroup,
          medicalNotes,
        },
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser);

    res.status(201).json({
      message: 'Signup successful',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      tokens: { accessToken, refreshToken },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};


// 🟡 LOGIN
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: 'Invalid credentials' });

    const tokens = generateTokens(user);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    });
  } catch (err) {
    console.error('Login Error:', err);
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
