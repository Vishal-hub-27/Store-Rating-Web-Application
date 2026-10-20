const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateName, validateEmail, validateAddress, validatePassword } = require('../utils/validators');

function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Only send safe fields to the frontend (never the password hash)
function userResponse(user) {
  return { id: user._id, name: user.name, email: user.email, address: user.address, role: user.role };
}

// POST /api/auth/register  (public sign up, always creates a normal "user")
async function register(req, res) {
  try {
    const { name, email, address, password } = req.body;

    // Collect every validation error so the user can fix them all at once
    const errors = [
      validateName(name),
      validateEmail(email),
      validateAddress(address),
      validatePassword(password),
    ].filter(Boolean);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'That email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // The role is NOT read from req.body, so nobody can register as an owner
    const user = await User.create({
      name: name.trim(),
      email,
      address,
      password: hashedPassword,
      role: 'user',
    });

    res.status(201).json({ token: createToken(user._id), user: userResponse(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'That email is already registered.' });
    }
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Could not register. Please try again.' });
  }
}

// POST /api/auth/login  (works for both user and owner accounts)
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    const passwordMatches = user && (await bcrypt.compare(password, user.password));
    if (!passwordMatches) {
      // Same message for both cases so we do not reveal which emails exist
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({ token: createToken(user._id), user: userResponse(user) });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Could not log in. Please try again.' });
  }
}

// GET /api/auth/me  (lets the frontend check a saved token on page refresh)
function getMe(req, res) {
  res.json({ user: userResponse(req.user) });
}

module.exports = { register, login, getMe };
