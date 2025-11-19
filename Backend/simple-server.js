require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, sparse: true }, // Allow multiple null emails for OAuth users
  phone: { type: String, default: null },
  password: { type: String, default: null }, // Optional for OAuth users
  loginCount: { type: Number, default: 0 },
  lastLoginAt: { type: Date, default: null },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  isPhoneVerified: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  // OAuth fields
  googleId: { type: String, default: null },
  githubId: { type: String, default: null },
  profilePic: { type: String, default: null },
  provider: { type: String, default: 'local' } // 'local', 'google', 'github'
}, {
  timestamps: true, // Adds createdAt and updatedAt
  versionKey: false // Disable __v field
});

const User = mongoose.model('User', userSchema);

// Passport configuration
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      // Update login tracking
      user.loginCount = (user.loginCount || 0) + 1;
      user.lastLoginAt = new Date();
      await user.save();
      return done(null, user);
    }
    
    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });
    if (user) {
      user.googleId = profile.id;
      user.profilePic = profile.photos[0].value;
      user.loginCount = (user.loginCount || 0) + 1;
      user.lastLoginAt = new Date();
      await user.save();
      return done(null, user);
    }
    
    // Create new user
    user = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      profilePic: profile.photos[0].value,
      provider: 'google',
      loginCount: 1,
      lastLoginAt: new Date()
    });
    
    await user.save();
    console.log('✅ New Google user created:', user.email);
    done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    done(error, null);
  }
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID || 'your-github-client-id',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || 'your-github-client-secret',
  callbackURL: '/api/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ githubId: profile.id });
    
    if (user) {
      // Update login tracking
      user.loginCount = (user.loginCount || 0) + 1;
      user.lastLoginAt = new Date();
      await user.save();
      return done(null, user);
    }
    
    // Check if user exists with same email
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    if (email) {
      user = await User.findOne({ email });
      if (user) {
        user.githubId = profile.id;
        user.profilePic = profile.photos[0].value;
        user.loginCount = (user.loginCount || 0) + 1;
        user.lastLoginAt = new Date();
        await user.save();
        return done(null, user);
      }
    }
    
    // Create new user
    user = new User({
      githubId: profile.id,
      name: profile.displayName || profile.username,
      email: email,
      profilePic: profile.photos[0].value,
      provider: 'github',
      loginCount: 1,
      lastLoginAt: new Date()
    });
    
    await user.save();
    console.log('✅ New GitHub user created:', user.email || user.name);
    done(null, user);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    done(error, null);
  }
}));

// OTP Generator
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Mock SMS service (replace with real SMS service like Twilio)
const sendSMS = async (phone, message) => {
  console.log(`📱 SMS to ${phone}: ${message}`);
  // In production, integrate with Twilio, AWS SNS, or other SMS service
  return true;
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Backend working!' });
});

// View all users (for testing - remove in production)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude only passwords
    res.json({ 
      count: users.length,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        loginCount: user.loginCount || 0,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password with salt rounds 12 for better security
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    console.log('🔐 Password hashed with bcrypt (salt rounds: 12)');
    console.log('📧 OTP generated:', otp);
    
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      otp, 
      otpExpiry, 
      isVerified: false 
    });
    await user.save();

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification OTP',
      html: `
        <h2>Email Verification</h2>
        <p>Thank you for registering! Your email verification OTP code is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>Please enter this code to verify your email address.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(201).json({
      message: 'User registered. Please verify your email with the OTP sent to your email address.',
      email: user.email,
      requiresVerification: true
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ 
        message: 'Please verify your email first',
        requiresVerification: true,
        email: user.email
      });
    }

    // Use bcrypt to compare plain password with hashed password
    console.log('🔍 Comparing passwords with bcrypt...');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('❌ Password comparison failed');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log('✅ Password comparison successful');
    
    // Update login tracking
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastLoginAt = new Date();
    await user.save();
    
    console.log(`📊 Login #${user.loginCount} for ${user.email}`);
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret-key', { expiresIn: '7d' });
    
    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        loginCount: user.loginCount,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Send OTP to phone
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    // Find or create user with phone
    let user = await User.findOne({ phone });
    if (!user) {
      // Create temporary user record for OTP verification
      user = new User({ phone, otp, otpExpiry });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
    }
    
    await user.save();
    
    // Send SMS (mock)
    await sendSMS(phone, `Your CraftMyFolio OTP is: ${otp}. Valid for 5 minutes.`);
    
    res.json({
      message: 'OTP sent successfully',
      phone: phone,
      expiresIn: '5 minutes'
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Verify OTP and login
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }
    
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }
    
    // Check OTP expiry
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }
    
    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // Update user
    user.isPhoneVerified = true;
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastLoginAt = new Date();
    user.otp = null; // Clear OTP
    user.otpExpiry = null;
    await user.save();
    
    console.log(`✅ OTP verified for ${phone}`);
    
    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret-key', { expiresIn: '7d' });
    
    res.json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        isPhoneVerified: user.isPhoneVerified,
        loginCount: user.loginCount,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Complete profile after OTP verification
app.post('/api/auth/complete-profile', async (req, res) => {
  try {
    const { phone, name, email, password } = req.body;
    
    const user = await User.findOne({ phone, isPhoneVerified: true });
    if (!user) {
      return res.status(400).json({ message: 'Phone not verified' });
    }
    
    // Update user profile
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
    }
    
    await user.save();
    
    res.json({
      message: 'Profile completed successfully',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        isPhoneVerified: user.isPhoneVerified
      }
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Google OAuth routes
app.get('/api/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }),
  async (req, res) => {
    // Generate JWT token
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET || 'secret-key', { expiresIn: '7d' });
    
    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      profilePic: req.user.profilePic,
      provider: req.user.provider
    }))}`);
  }
);

// Forgot Password - Send OTP
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email does not exist. Please check your email address or sign up first.' });
    }
    
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    
    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <h2>Password Reset Request</h2>
        <p>Your OTP code for password reset is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'Password reset OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
});

// Verify Reset OTP
app.post('/api/auth/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email does not exist. Please check your email address.' });
    }
    
    if (!user.otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired or invalid' });
    }
    
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    const resetToken = jwt.sign({ userId: user._id, purpose: 'password-reset' }, process.env.JWT_SECRET || 'secret-key', { expiresIn: '15m' });
    
    res.json({
      message: 'OTP verified. You can now reset your password.',
      resetToken
    });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
  }
});

// Verify Email OTP (for signup)
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired or invalid' });
    }
    
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // Mark user as verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret-key', { expiresIn: '7d' });
    
    res.json({
      message: 'Email verified successfully! You can now login.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Failed to verify email', error: error.message });
  }
});

// Resend Verification OTP
app.post('/api/auth/resend-verification-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }
    
    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    
    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification OTP',
      html: `
        <h2>Email Verification</h2>
        <p>Your new email verification OTP code is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'Verification OTP resent successfully' });
  } catch (error) {
    console.error('Resend verification OTP error:', error);
    res.status(500).json({ message: 'Failed to resend verification OTP', error: error.message });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;
    
    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'secret-key');
      if (decoded.purpose !== 'password-reset') {
        return res.status(400).json({ message: 'Invalid reset token' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
});

// GitHub OAuth routes
app.get('/api/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

app.get('/api/auth/github/callback',
  passport.authenticate('github', { failureRedirect: 'http://localhost:3000/login' }),
  async (req, res) => {
    // Generate JWT token
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET || 'secret-key', { expiresIn: '7d' });
    
    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      profilePic: req.user.profilePic,
      provider: req.user.provider
    }))}`);
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Test in browser: http://localhost:${PORT}`);
  console.log(`📞 OTP endpoints available`);
  console.log(`🔐 OAuth endpoints:`);
  console.log(`   Google: http://localhost:${PORT}/api/auth/google`);
  console.log(`   GitHub: http://localhost:${PORT}/api/auth/github`);
});