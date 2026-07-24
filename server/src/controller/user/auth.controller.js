const User = require('../../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { generateAccessToken, generateRefreshToken } = require('../../util/token.util');
const { sendVerificationEmail } = require('../../util/email.util');

// Helper to generate access and refresh tokens, save refresh token to DB, and set cookie
const generateTokensAndSetCookie = async (user, res) => {
  const accessToken = generateAccessToken(user._id, user.email, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token to DB
  await User.findByIdAndUpdate(user._id, { refreshToken });

  // Set refresh token in HttpOnly Cookie
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  return { accessToken };
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Please provide all required fields: name, email, password, phone' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: role || 'user',
      isVerified: false,
      verificationToken: token,
      verificationTokenExpires: tokenExpiry,
      lastVerificationSentAt: Date.now()
    });

    const savedUser = await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(savedUser.email, savedUser.name, token);
    } catch (emailError) {
      console.error('Failed to send verification email during registration:', emailError);
    }

    // Create notification for admin
    try {
      const Notification = require('../../models/notification.model');
      await Notification.create({
        type: 'new_user',
        title: 'New User Registered (Unverified)',
        message: `${savedUser.name} (${savedUser.email}) registered. Verification email sent.`,
        link: `/admin/users/${savedUser._id}`
      });
    } catch (notificationError) {
      console.error('Failed to create registration notification:', notificationError);
    }

    return res.status(201).json({
      message: 'Registration successful! A verification link has been sent to your email address. Please check your inbox and verify your email to log in.',
      unverified: true
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ message: 'Server error. Registration failed.' });
  }
};

// @desc    Login user & get tokens
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Wrong password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Your email address is not verified yet. Please check your inbox or click "Resend Verification" to request a new link.',
        notVerified: true,
        email: user.email
      });
    }

    const { accessToken } = await generateTokensAndSetCookie(user, res);

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses || []
      },
      accessToken
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error. Login failed.' });
  }
};

// @desc    Logout user / clear tokens
// @route   POST /api/users/logout
// @access  Public
const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = '';
        await user.save();
      }
    } else if (req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.refreshToken = '';
        await user.save();
      }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    return res.status(500).json({ message: 'Server error. Logout failed.' });
  }
};

// @desc    Refresh access token
// @route   POST /api/users/refresh
// @access  Public
const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is missing' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid session or refresh token mismatch' });
    }

    const { accessToken } = await generateTokensAndSetCookie(user, res);

    return res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken
    });
  } catch (error) {
    console.error('Refresh Token Error:', error);
    return res.status(500).json({ message: 'Server error during token refresh' });
  }
};

// @desc    Google Sign-In
// @route   POST /api/users/google
// @access  Public
const googleSignIn = async (req, res) => {
  try {
    const { credential, accessToken: googleAccessToken } = req.body;

    if (!credential && !googleAccessToken) {
      return res.status(400).json({ message: 'Google credential (ID Token) or Access Token is required.' });
    }

    let googleId, email, name;

    if (credential) {
      let ticket;
      try {
        ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID
        });
      } catch (err) {
        console.error('Google verification library error:', err.message);
        return res.status(400).json({ message: 'Invalid or expired Google ID Token.' });
      }

      const payload = ticket.getPayload();

      const issuer = payload.iss;
      if (issuer !== 'https://accounts.google.com' && issuer !== 'accounts.google.com') {
        return res.status(400).json({ message: 'Invalid Google token issuer' });
      }

      if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
        return res.status(400).json({ message: 'Invalid Google token audience' });
      }

      if (!payload.email_verified) {
        return res.status(400).json({ message: 'Google email is not verified' });
      }

      googleId = payload.sub;
      email = payload.email.toLowerCase();
      name = payload.name;
    } else {
      // Fetch user profile from google API using the access token
      let gRes;
      try {
        gRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleAccessToken}`);
      } catch (fetchErr) {
        console.error('Google API userinfo fetch error:', fetchErr.message);
        return res.status(500).json({ message: 'Failed to verify token with Google servers.' });
      }

      const gData = await gRes.json();

      if (gData.error || !gData.email) {
        return res.status(400).json({ message: gData.error_description || 'Invalid or expired Google Access Token.' });
      }

      googleId = gData.sub;
      email = gData.email.toLowerCase();
      name = gData.name || 'Google User';
    }

    let user = await User.findOne({ email });

    if (user) {
      if (user.provider === 'local') {
        return res.status(400).json({
          message: 'An account already exists with this email. Please log in using your password.'
        });
      }

      if (user.provider === 'google' && user.googleId && user.googleId !== googleId) {
        return res.status(400).json({
          message: 'Unauthorized. Google ID mismatch.'
        });
      }

      if (!user.googleId) {
        user.googleId = googleId;
      }
      user.name = name;
      user.isVerified = true;
      await user.save();
    } else {
      user = new User({
        name,
        email,
        googleId,
        provider: 'google',
        role: 'user',
        isVerified: true
      });
      await user.save();

      // Trigger notification
      try {
        const Notification = require('../../models/notification.model');
        await Notification.create({
          type: 'new_user',
          title: 'New User Registered',
          message: `${user.name} (${user.email}) registered a new account (via Google).`,
          link: `/admin/users/${user._id}`
        });
      } catch (notificationError) {
        console.error('Failed to create Google registration notification:', notificationError);
      }
    }

    const { accessToken } = await generateTokensAndSetCookie(user, res);

    return res.status(200).json({
      message: 'Google login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses || []
      },
      accessToken
    });
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return res.status(500).json({ message: 'Server error during Google Sign-In.' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired email verification link. Please request a new one.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    const { accessToken } = await generateTokensAndSetCookie(user, res);

    return res.status(200).json({
      message: 'Email verified successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses || []
      },
      accessToken
    });
  } catch (error) {
    console.error('Verify Email Error:', error);
    return res.status(500).json({ message: 'Server error. Email verification failed.' });
  }
};

// @desc    Resend verification email
// @route   POST /api/users/resend-verification
// @access  Public
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'This account is already verified. Please log in.' });
    }

    // Cooldown check (60 seconds)
    if (user.lastVerificationSentAt && (Date.now() - user.lastVerificationSentAt < 60000)) {
      const waitTime = Math.ceil((60000 - (Date.now() - user.lastVerificationSentAt)) / 1000);
      return res.status(429).json({
        message: `Please wait ${waitTime} seconds before requesting another verification email.`,
        cooldownRemaining: waitTime
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.verificationToken = token;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    user.lastVerificationSentAt = Date.now();
    await user.save();

    try {
      await sendVerificationEmail(user.email, user.name, token);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({ message: 'Failed to send verification email. Please try again later.' });
    }

    return res.status(200).json({
      message: 'Verification link resent successfully! Please check your inbox.'
    });
  } catch (error) {
    console.error('Resend Verification Error:', error);
    return res.status(500).json({ message: 'Server error. Failed to resend verification link.' });
  }
};

// @desc    Login or register via Facebook OAuth
// @route   POST /api/users/facebook-login
// @access  Public
const facebookSignIn = async (req, res) => {
  try {
    const { accessToken: fbToken, code, redirectUri } = req.body;
    let userAccessToken = fbToken;

    // If OAuth code is provided, exchange it for access token using App ID and App Secret
    if (!userAccessToken && code) {
      const appId = process.env.FACEBOOK_APP_ID;
      const appSecret = process.env.FACEBOOK_APP_SECRET;

      if (!appId || !appSecret) {
        return res.status(400).json({ message: 'Facebook Auth is not configured on server (missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET).' });
      }

      const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri || `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`)}&client_secret=${appSecret}&code=${code}`;
      const tokenRes = await fetch(tokenUrl);
      const tokenData = await tokenRes.json();

      if (tokenData.error) {
        return res.status(400).json({ message: tokenData.error.message || 'Failed to exchange Facebook code.' });
      }
      userAccessToken = tokenData.access_token;
    }

    if (!userAccessToken) {
      return res.status(400).json({ message: 'Facebook access token or code is required.' });
    }

    // Verify access token with Graph API
    const graphRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${userAccessToken}`);
    const fbData = await graphRes.json();

    if (fbData.error) {
      return res.status(400).json({ message: fbData.error.message || 'Invalid Facebook token.' });
    }

    const facebookId = fbData.id;
    const name = fbData.name || 'Facebook User';
    const email = fbData.email ? fbData.email.toLowerCase() : null;

    const isProxyEmail = email && email.endsWith('@facebook.com');
    const finalEmail = (email && !isProxyEmail) ? email : null;

    let user = null;

    if (finalEmail) {
      user = await User.findOne({ $or: [{ facebookId }, { email: finalEmail }] });
    } else {
      user = await User.findOne({ facebookId });
    }

    // If user does not exist or has a proxy/null email, we require their original email
    if (!user || !user.email || user.email.endsWith('@facebook.com')) {
      return res.status(200).json({
        needsEmail: true,
        facebookId,
        name
      });
    }

    if (user.provider === 'local') {
      return res.status(400).json({
        message: 'An account already exists with this email. Please log in using your password.'
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Your email address is not verified yet. Please check your inbox or click "Resend Verification" to request a new link.',
        notVerified: true,
        email: user.email
      });
    }

    if (!user.facebookId) {
      user.facebookId = facebookId;
    }
    user.name = name;
    await user.save();

    const { accessToken } = await generateTokensAndSetCookie(user, res);

    return res.status(200).json({
      message: 'Facebook login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses || []
      },
      accessToken
    });
  } catch (error) {
    console.error('Facebook Sign-In Error:', error);
    return res.status(500).json({ message: 'Server error during Facebook Sign-In.' });
  }
};

// @desc    Register with original email for Facebook oauth flow
// @route   POST /api/users/facebook-register
// @access  Public
const facebookRegister = async (req, res) => {
  try {
    const { name, email, facebookId } = req.body;

    if (!email || !facebookId) {
      return res.status(400).json({ message: 'Email and Facebook ID are required.' });
    }

    if (email.toLowerCase().endsWith('@facebook.com')) {
      return res.status(400).json({ message: 'Please enter a valid original email address (cannot be @facebook.com proxy).' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      if (user.facebookId && user.facebookId === facebookId) {
        if (!user.isVerified) {
          const token = crypto.randomBytes(32).toString('hex');
          user.verificationToken = token;
          user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
          user.lastVerificationSentAt = Date.now();
          await user.save();
          await sendVerificationEmail(user.email, user.name, token);
          return res.status(200).json({
            message: 'Verification link sent! Please check your inbox to verify your email.'
          });
        }
        return res.status(400).json({ message: 'This email is already verified and linked to your Facebook account.' });
      }
      return res.status(400).json({ message: 'An account already exists with this email address.' });
    }

    user = await User.findOne({ facebookId });
    const token = crypto.randomBytes(32).toString('hex');

    if (user) {
      user.email = email.toLowerCase();
      user.name = name || user.name;
      user.isVerified = false;
      user.verificationToken = token;
      user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
      user.lastVerificationSentAt = Date.now();
      await user.save();
    } else {
      user = new User({
        name: name || 'Facebook User',
        email: email.toLowerCase(),
        facebookId,
        provider: 'facebook',
        role: 'user',
        isVerified: false,
        verificationToken: token,
        verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
        lastVerificationSentAt: Date.now()
      });
      await user.save();
    }

    try {
      await sendVerificationEmail(user.email, user.name, token);
    } catch (emailErr) {
      console.error('Failed to send Facebook verification email:', emailErr);
    }

    return res.status(200).json({
      message: 'Verification link sent! Please check your inbox and verify your email to log in.'
    });
  } catch (error) {
    console.error('Facebook registration error:', error);
    return res.status(500).json({ message: 'Server error during Facebook registration.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  googleSignIn,
  facebookSignIn,
  facebookRegister,
  verifyEmail,
  resendVerification
};
