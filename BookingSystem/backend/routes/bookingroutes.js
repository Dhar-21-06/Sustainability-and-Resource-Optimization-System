const express = require('express');
const Booking = require('../models/bookings');
const Slot = require('../models/slot');
const router = express.Router();
const { notifyUsersAboutAvailableSlots, deleteOldNotifications } = require('../controllers/notificationcontroller');
const User = require('../models/user');
const Notification = require('../models/notification');
const Profile = require('../models/profile'); // ⬅ Add at the top if not already

// 📌 User requests a slot
router.post('/request', async (req, res) => {
  const { userId, lab, date, time, purpose } = req.body;

  try {
    console.log("🛬 Incoming booking request:", req.body);

    const approvedBooking = await Booking.findOne({
      lab,
      date,
      time,
      status: 'Approved'
    });

    if (approvedBooking) {
      return res.status(400).json({ message: 'Slot already booked by another user' });
    }

    // ✅ 24-hour block if recently rejected
    const recentRejection = await Booking.findOne({
      userId,
      lab,
      date,
      time,
      status: 'Rejected'
    }).sort({ rejectionTimestamp: -1 });

    if (recentRejection) {
      const blockedUntil = new Date(recentRejection.rejectionTimestamp);
      blockedUntil.setHours(blockedUntil.getHours() + 24);
      if (new Date() < blockedUntil) {
        return res.status(403).json({ message: 'You must wait 24 hours before rebooking this slot' });
      }
    }

    // ✅ Still allow multiple users to request pending
    const existingPending = await Booking.findOne({
      lab,
      date,
      time,
      status: 'Pending',
      userId,
    });

    if (existingPending) {
      return res.status(409).json({ message: 'You have already requested this slot' });
    }

    // ✅ Create new booking
    const newBooking = new Booking({ userId, lab, date, time, purpose });
    await newBooking.save();

    // ✅ Ensure the slot exists and remains available until approval
    await Slot.findOneAndUpdate(
      { lab, date, time },
      { $setOnInsert: { isAvailable: true } },
      { upsert: true }
    );


    // ✅ Notification to Admins
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("✅ Matching admin profiles for lab:", lab);
    const labName = lab.trim().toLowerCase();
    const profiles = await Profile.find({ role: 'admin', labIncharge: { $regex: new RegExp(`^${labName}$`, 'i') } });
    console.log("✅ Matched profiles:", profiles.map(p => p.email));
    console.log("📌 User data:", user);

    const msg = `${user.name} has requested a booking for ${lab} on ${date} at ${time}. Purpose: ${purpose}`;


    for (const profile of profiles) {
      const admin = await User.findOne({ email: profile.email });
      if (admin) {
        await Notification.create({
          userId: admin._id,
          message: msg,
          role: 'admin',
          link: '/admin/pending-requests',
          bookingId: newBooking._id
        });
        console.log(`📨 Sending notification to ${profile.email}`);
      }
    }

    res.status(200).json({ message: 'Booking request submitted', booking: newBooking });

  } catch (err) {
    console.error("❌ Error in /request:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// 📌 Cancel a booking (user)
router.patch('/cancel/:id', async (req, res) => {
  const bookingId = req.params.id;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const user = await User.findById(booking.userId);

    // ✅ Only notify admins if it was previously Approved
    if (booking.status === 'Approved') {
      const labName = booking.lab.trim().toLowerCase(); // ✅ Fix: use booking.lab
      console.log("✅ Matching admin profiles for lab:", labName);

      const profiles = await Profile.find({
        role: 'admin',
        labIncharge: { $regex: new RegExp(`^${labName}$`, 'i') }
      });

      console.log("✅ Matched profiles:", profiles.map(p => p.email));

      const msg = `${user.name} has cancelled their approved booking for ${booking.lab} on ${booking.date} at ${booking.time}.`;

      for (const profile of profiles) {
        const admin = await User.findOne({ email: profile.email });
        if (admin) {
          await Notification.create({
            userId: admin._id,
            message: msg,
            role: 'admin',
            link: '',
            bookingId: booking._id 
          });
        }
      }
    }

    // ✅ Free the slot
    await Slot.findOneAndUpdate(
      { lab: booking.lab, date: booking.date, time: booking.time },
      { isAvailable: true },
      { upsert: true }
    );

    booking.status = 'Cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled and slot released' });
  } catch (err) {
    console.error("❌ Cancel booking error:", err); // ✅ add for debugging
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// 📌 Admin approves booking
router.patch('/approve/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'Approved';
    await booking.save();

    // ✅ Set the slot as unavailable
await Slot.findOneAndUpdate(
  { lab: booking.lab, date: booking.date, time: booking.time },
  { isAvailable: false },
  { upsert: true }
);

// ✅ Reject all other pending bookings for the same slot
await Booking.updateMany(
  {
    lab: booking.lab,
    date: booking.date,
    time: booking.time,
    status: 'Pending',
    _id: { $ne: booking._id }
  },
  {
    $set: {
      status: 'Rejected',
      rejectionTimestamp: new Date()
    }
  }
);

// ✅ Notify rejected users
const rejectedBookings = await Booking.find({
  lab: booking.lab,
  date: booking.date,
  time: booking.time,
  status: 'Rejected'
}).populate('userId', 'name');  // ✅ this brings user name along with booking

for (const rejected of rejectedBookings) {
  await Notification.create({
    userId: rejected.userId._id,
    message: `❌ Hi ${rejected.userId.name}, Your booking for ${booking.lab} on ${booking.date} at ${booking.time} was auto-rejected as another request was approved.`,
    role: 'faculty',
    link: '/user/bookings#history',
    bookingId: booking._id
  });
}

    const user = await User.findById(booking.userId)
    const msg = `✅Hi ${user.name}, Your booking for ${booking.lab} on ${booking.date} at ${booking.time} has been approved.`;

    await Notification.create({
      userId: booking.userId,
      message: msg,
      role: 'faculty',
      link: '/user/bookings#current',
      bookingId: booking._id 
    });

    res.json({ message: 'Booking approved and notification sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// 📌 Admin rejects booking with reason
router.patch('/reject/:id', async (req, res) => {
  const { reason } = req.body;

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'Rejected';
    booking.rejectionTimestamp = new Date();
    await booking.save();
    const user = await User.findById(booking.userId);

    const msg = `❌ Hi ${user.name}, Your booking for ${booking.lab} on ${booking.date} at ${booking.time} was rejected.\nReason: ${reason}`;

    await Notification.create({
      userId: booking.userId,
      message: msg,
      role: 'faculty',
      link: '/user/bookings#history',
      bookingId: booking._id
    });

    res.json({ message: 'Booking rejected and notification sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 📌 Get all pending bookings (for Admin)
router.get('/pending', async (req, res) => {
  const { adminEmail } = req.query;

  try {
    if (!adminEmail) {
      return res.status(400).json({ message: 'Admin email is required' });
    }

    const adminProfile = await Profile.findOne({ email: adminEmail, role: 'admin' });
    if (!adminProfile) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }

    const labIncharge = adminProfile.labIncharge;
    if (!labIncharge) {
      return res.status(400).json({ message: 'Admin is not in charge of any lab' });
    }

    // 🔐 Get only pending requests for this lab
    const pendingBookings = await Booking.find({
      status: 'Pending',
      lab: labIncharge
    })
      .populate('userId', 'name email')
      .sort({ requestedAt: -1 });

    res.json(pendingBookings);
  } catch (err) {
    console.error("❌ Error in /pending:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// ✅ 📌 Get all approved bookings (for Admin dashboard or calendar)
router.get('/approved', async (req, res) => {
  try {
    const approved = await Booking.find({ status: 'Approved' }).populate('userId', 'name email').sort({ date: 1 });
    res.json(approved);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 📌 Get all bookings for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId }).sort({ date: 1, time: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 📌 Get booking history for a user (Rejected + Cancelled)
router.get('/history/:userId', async (req, res) => {
  try {
    // Maybe run this in cron or check when fetching
    const now = new Date();
    await Booking.updateMany(
      {
        status: 'Approved',
        $expr: {
          $lt: [
            { $dateFromString: { dateString: { $concat: ['$date', 'T', '$time'] } } },
            now
          ]
        }
      },
      { $set: { status: 'Completed' } }
    );
    const history = await Booking.find({
      userId: req.params.userId,
      status: { $in: ['Rejected', 'Cancelled','Completed'] }
    });

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 📌 Get available slots (with 24hr unblock logic)
router.get('/available', async (req, res) => {
  const { lab, date } = req.query;

  try {
    const allSlots = await Slot.find({ lab, date });
    const availableSlots = [];

    for (const slot of allSlots) {
      if (slot.isAvailable) {
        availableSlots.push(slot);
      } else {
        const recentRejection = await Booking.findOne({
          lab: slot.lab,
          date: slot.date,
          time: slot.time,
          status: 'Rejected'
        }).sort({ rejectionTimestamp: -1 });

        if (recentRejection) {
          const blockedUntil = new Date(recentRejection.rejectionTimestamp);
          blockedUntil.setHours(blockedUntil.getHours() + 24);

          if (new Date() > blockedUntil) {
            // Unblock slot after 24 hours
            slot.isAvailable = true;
            await slot.save();
            availableSlots.push(slot);

            // Check if user was already notified
            const existingNotification = await Notification.findOne({
              userId: recentRejection.userId,
              message: {
                $regex: `${slot.lab}.*${slot.date}.*${slot.time}`, // fuzzy check to avoid duplicates
                $options: 'i'
              }
            });
            if (!existingNotification) {
              const msg = `The previously rejected slot for ${slot.lab} on ${slot.date} at ${slot.time} is now available again. You may try booking it again if needed.`;
              await Notification.create({ userId: recentRejection.userId, message: msg, role: 'faculty', link: '/user/bookings#history', bookingId: recentRejection._id });
            }
          }
        }
      }
    }

    res.json(availableSlots);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 📌 Run this periodically or manually to notify users about available rejected slots
router.get('/check-rejected-available', async (req, res) => {
  try {
    const result = await notifyUsersAboutAvailableSlots();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📌 Run this periodically to clean up old notifications
router.delete('/cleanup-old', async (req, res) => {
  try {
    const result = await deleteOldNotifications();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// In slotroutes.js or bookingroutes.js
router.get('/slots/all', async (req, res) => {
  try {
    const allSlots = await Slot.find({});
    const formatted = {};

    for (const slot of allSlots) {
      if (!formatted[slot.lab]) formatted[slot.lab] = [];
      formatted[slot.lab].push({
        time: slot.time,
        status: slot.isAvailable ? 'Available' : 'Booked' // or add logic to show Pending
      });
    }

    const result = Object.entries(formatted).map(([labName, slots]) => ({
      labName,
      slots
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📌 Get all bookings for a specific lab on a specific date
router.get('/lab/:lab/:date', async (req, res) => {
  const { lab, date } = req.params;

  try {
    const bookings = await Booking.find({ lab, date });

    const booked = bookings
      .filter(b => b.status === 'Approved')
      .map(b => ({
        time: b.time,
        userId: b.userId.toString(),
        status: 'Approved'
      }));

    const pending = bookings
      .filter(b => b.status === 'Pending')
      .map(b => ({
        time: b.time,
        userId: b.userId.toString(),
        status: 'Pending',
        purpose: b.purpose
      }));

    res.json({
      booked,
      pending
    });
    console.log(pending)
  } catch (err) {
    console.error('❌ Error fetching bookings for lab and date:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// 📌 Get all slots for a specific lab (for AdminCheckAllocation page)
router.get('/slots/:labName', async (req, res) => {
  const labName = req.params.labName;

  try {
    const slots = await Slot.find({ lab: labName }).sort({ date: 1, time: 1 });

    const result = slots.map(slot => ({
      date: slot.date,
      time: slot.time,
      isAvailable: slot.isAvailable
    }));

    res.json(result);
  } catch (err) {
    console.error('❌ Failed to fetch slots for lab:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 📌 Get all upcoming approved bookings (used for Upcoming Events)
router.get('/upcoming', async (req, res) => {
  try {
    const upcoming = await Booking.find({ status: 'Approved' })
      .populate('userId', 'name')  // populate user's name
      .sort({ date: 1, time: 1 });

    res.json(upcoming);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


module.exports = router;
