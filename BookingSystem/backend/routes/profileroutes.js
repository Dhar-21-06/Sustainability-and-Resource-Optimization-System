// routes/profileroutes.js
const express = require('express');
const router = express.Router();
const Profile = require('../models/profile');
const Lab = require('../models/lab');

// POST create/update profile
router.post('/save-profile', async (req, res) => {
  try {
    const { email, role, firstName, lastName, labIncharge, department, phoneNumber } = req.body;
    console.log('Received profile save request:', req.body);

    let profile = await Profile.findOne({ email });
    console.log('Incoming email:', email);

    if (profile) {
      profile.role = role;
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.phoneNumber = phoneNumber;

      if (role.toLowerCase() === 'admin') {
        profile.labIncharge = labIncharge;
        profile.department = '';  // clear department if admin
      } else if (role.toLowerCase() === 'faculty') {
        profile.department = department;
        profile.labIncharge = '';  // clear labIncharge if faculty
      }

      await profile.save();
    } else {
      profile = new Profile({
        email,
        role,
        firstName,
        lastName,
        phoneNumber,
        labIncharge: role.toLowerCase() === 'admin' ? labIncharge : '',
        department: role.toLowerCase() === 'faculty' ? department : ''
      });

      await profile.save();
      console.log('Profile saved:', profile);
    }

    // Update Lab incharge details if Admin
    const normalizedRole = role.toLowerCase();
    if (normalizedRole === 'admin' && labIncharge) {
      await Lab.findOneAndUpdate(
        { name: labIncharge },
        {
          incharge: {
            name: `${firstName} ${lastName}`,
            email: email,
            phone: phoneNumber
          }
        }
      );
    }

    res.status(200).json({ message: 'Profile saved successfully', profile });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
  console.log('Received department:', department);
});

// GET profile by email
router.get('/get-profile/:email', async (req, res) => {
  try {
    const profile = await Profile.findOne({ email: req.params.email });
    if (profile) {
      res.status(200).json(profile);
    } else {
      res.status(404).json({ message: 'Profile not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Simple test route
router.get('/test', (req, res) => {
  console.log('Test route hit');
  res.send('Profile route working');
});

module.exports = router;
