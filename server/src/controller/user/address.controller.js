const User = require('../../models/user.model');

// @desc    Add user address
// @route   POST /api/users/addresses
// @access  Protected
const addUserAddress = async (req, res) => {
  try {
    const { name, phone, street, country, state, district, zip, isDefault } = req.body;

    if (!name || !phone || !street || !country || !state || !district || !zip) {
      return res.status(400).json({ message: 'Please provide all required address fields.' });
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
      isDefault: isDefault || (user.addresses.length === 0)
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

    user.addresses.pull({ _id: addressId });
    
    // If we deleted the default address and have other addresses left, set the first one as default
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

module.exports = {
  addUserAddress,
  updateUserAddress,
  deleteUserAddress
};
