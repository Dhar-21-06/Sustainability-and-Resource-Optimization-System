// routes/profileroutes.js
const express = require('express');
const router = express.Router();
const Profile = require('../models/profile');
const Lab = require('../models/lab');

// POST create/update profile
router.post('/save-profile', async (req, res) => {
  try {
    const { email, role, firstName, lastName, labIncharge, department, phoneNumber } = req.body;

    console.log('--- Incoming Profile Data ---');
    console.log('Email:', email);
    console.log('Role:', role);
    console.log('First Name:', firstName);
    console.log('Last Name:', lastName);
    console.log('Phone:', phoneNumber);
    console.log('LabIncharge:', labIncharge);
    console.log('Department:', department);

    let profile = await Profile.findOne({ email });

    if (profile) {
      console.log('Profile exists, updating...');

      profile.role = role;
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.phoneNumber = phoneNumber;

      if (role.toLowerCase() === 'admin') {
        profile.labIncharge = labIncharge;
        profile.department = '';
      } else if (role.toLowerCase() === 'faculty') {
        profile.department = department;
        profile.labIncharge = '';
      }

      await profile.save();
      console.log('Profile updated:', profile);

    } else {
      console.log('New profile, creating...');
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

    if (role.toLowerCase() === 'admin' && labIncharge) {
      const updatedLab = await Lab.findOneAndUpdate(
        { name: labIncharge },
        {
          incharge: {
            name: `${firstName} ${lastName}`,
            email,
            phone: phoneNumber
          }
        },
        { new: true }
      );

      console.log('Lab updated:', updatedLab);
    }

    res.status(200).json({ message: 'Profile saved successfully', profile });

  } catch (error) {
    console.error('❌ Error saving profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
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
