const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { generateAccessToken, generateRefreshToken } = require('../util/token.util');

// Helper to generate access and refresh tokens, save refresh token to DB, and set cookie
const generateTokensAndSetCookie = async (user, res) => {
  // Generate tokens using the isolated utility functions
  const accessToken = generateAccessToken(user._id, user.email, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token to DB using direct findByIdAndUpdate (highly secure, bypasses save validation hooks)
  await User.findByIdAndUpdate(user._id, { refreshToken });

  // Set refresh token in HttpOnly Cookie
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
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

    // Phone number is now mandatory
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Please provide all required fields: name, email, password, phone' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password directly in controller before save
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: role || 'user'
    });

    const savedUser = await user.save();

    // Generate tokens
    const { accessToken } = await generateTokensAndSetCookie(savedUser, res);

    // Return user details and access token
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        phone: savedUser.phone,
        role: savedUser.role,
        addresses: savedUser.addresses || []
      },
      accessToken
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

    // Compare passwords directly in controller
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Wrong password.' });
    }

    // Generate tokens
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
// @access  Public (or Protected)
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

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Protected
const getUserProfile = async (req, res) => {
  try {
    return res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        addresses: req.user.addresses || []
      }
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({ message: 'Server error. Could not retrieve profile.' });
  }
};

// @desc    Update user profile details
// @route   PUT /api/users/profile
// @access  Protected
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email, and phone number are required.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if email is already taken by another user
    if (email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: 'Another account is already using this email address.' });
      }
    }

    user.name = name;
    user.email = email.toLowerCase();
    user.phone = phone;

    const updatedUser = await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        addresses: updatedUser.addresses || []
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ message: 'Server error. Profile update failed.' });
  }
};

// @desc    Add new address to profile
// @route   POST /api/users/addresses
// @access  Protected
const addUserAddress = async (req, res) => {
  try {
    const { name, phone, street, country, state, district, zip, isDefault } = req.body;

    if (!name || !phone || !street || !country || !state || !district || !zip) {
      return res.status(400).json({ message: 'Please provide all required address fields: name, phone, street, country, state, district, zip.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // If setting as default, unset other default addresses
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      name,
      phone,
      street,
      country,
      state,
      district,
      zip,
      isDefault: isDefault || (user.addresses.length === 0) // default if first address
    };

    user.addresses.push(newAddress);
    await user.save();

    return res.status(201).json({
      message: 'Address added successfully',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Add Address Error:', error);
    return res.status(500).json({ message: 'Server error. Failed to add address.' });
  }
};

// @desc    Update user address
// @route   PUT /api/users/addresses/:addressId
// @access  Protected
const updateUserAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { name, phone, street, country, state, district, zip, isDefault } = req.body;

    if (!name || !phone || !street || !country || !state || !district || !zip) {
      return res.status(400).json({ message: 'Please provide all required address fields.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found.' });
    }

    // If setting as default, unset other default addresses
    if (isDefault) {
      user.addresses.forEach(addr => {
        if (addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }

    address.name = name;
    address.phone = phone;
    address.street = street;
    address.country = country;
    address.state = state;
    address.district = district;
    address.zip = zip;
    address.isDefault = isDefault || address.isDefault;

    await user.save();

    return res.status(200).json({
      message: 'Address updated successfully',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Update Address Error:', error);
    return res.status(500).json({ message: 'Server error. Failed to update address.' });
  }
};

// @desc    Delete user address
// @route   DELETE /api/users/addresses/:addressId
// @access  Protected
const deleteUserAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Remove the subdocument
    user.addresses.pull({ _id: addressId });
    
    // If we deleted the default address, and we still have other addresses left, make the first one default
    const hasDefault = user.addresses.some(addr => addr.isDefault);
    if (!hasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      message: 'Address deleted successfully',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Delete Address Error:', error);
    return res.status(500).json({ message: 'Server error. Failed to delete address.' });
  }
};

const googleSignIn = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential (ID Token) is required' });
    }

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

    // Verify issuer (iss)
    const issuer = payload.iss;
    if (issuer !== 'https://accounts.google.com' && issuer !== 'accounts.google.com') {
      return res.status(400).json({ message: 'Invalid Google token issuer' });
    }

    // Verify audience (aud)
    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({ message: 'Invalid Google token audience' });
    }

    // Verify email_verified
    if (!payload.email_verified) {
      return res.status(400).json({ message: 'Google email is not verified' });
    }

    const googleId = payload.sub; // unique Google ID
    const email = payload.email.toLowerCase();
    const name = payload.name;
    const picture = payload.picture || '';

    // Check if user already exists with this email
    let user = await User.findOne({ email });

    if (user) {
      // If user exists with provider = local, reject auto-linking as per requirements
      if (user.provider === 'local') {
        return res.status(400).json({
          message: 'An account already exists with this email. Please log in using your password.'
        });
      }

      // If user exists with provider = google, verify googleId matches
      if (user.provider === 'google' && user.googleId !== googleId) {
        return res.status(400).json({
          message: 'Unauthorized. Google ID mismatch.'
        });
      }

      // Update name if changed on Google profile
      if (user.name !== name) {
        user.name = name;
        await user.save();
      }
    } else {
      // Create new Google user
      user = new User({
        name,
        email,
        googleId,
        provider: 'google',
        role: 'user'
      });
      await user.save();
    }

    // Reuse existing login token generation & cookie helper
    const { accessToken } = await generateTokensAndSetCookie(user, res);

    return res.status(200).json({
      message: 'Google login successful',
      accessToken
    });
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return res.status(500).json({ message: 'Server error during Google Sign-In.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getUserProfile,
  updateUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  googleSignIn
};
