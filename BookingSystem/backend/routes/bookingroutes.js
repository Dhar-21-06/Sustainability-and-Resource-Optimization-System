const express = require('express');
const Booking = require('../models/bookings');
const Slot = require('../models/slot');
const router = express.Router();
const { notifyUsersAboutAvailableSlots, deleteOldNotifications } = require('../controllers/notificationcontroller');

// 📌 User requests a slot
router.post('/request', async (req, res) => {
  const { userId, lab, date, time, purpose } = req.body; // ✅ accept purpose

  try {
    const existingSlot = await Slot.findOne({ lab, date, time });

    const approvedBooking = await Booking.findOne({
      lab,
      date,
      time,
      status: 'Approved'
    });
    if (approvedBooking && approvedBooking.userId.toString() !== userId) {
      return res.status(400).json({ message: 'Slot already booked by another user' });
    }

    // 🛑 Check if this user was recently rejected for the same slot
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

    if (existingSlot && !existingSlot.isAvailable) {
      return res.status(400).json({ message: 'Slot not available' });
    }

    await Slot.findOneAndUpdate(
      { lab, date, time },
      { isAvailable: false },
      { upsert: true }
    );

    // ⚠️ Warn if slot is already in Pending state by someone else
    const existingPending = await Booking.findOne({
      lab,
      date,
      time,
      status: 'Pending'
    });
    if (existingPending && existingPending.userId.toString() !== userId) {
      return res.status(409).json({
        message: 'This slot is already requested by another user. Do you still want to proceed?',
        pending: true
      });
    }

    const newBooking = new Booking({ userId, lab, date, time, purpose }); // ✅ store purpose
    await newBooking.save();

    const User = require('../models/user');
    const Notification = require('../models/notification');
    const user = await User.findById(userId);
    const admins = await User.find({ role: 'admin' });
    
    const msg = `${user.name} has requested a booking for ${lab} on ${date} at ${time}.`;
    
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        message: msg + ` View Pending`,
      });
    }

    res.status(201).json({ message: 'Booking request submitted', booking: newBooking });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }

});


// 📌 Cancel a booking (user)
router.patch('/cancel/:id', async (req, res) => {
  const bookingId = req.params.id;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    await Slot.findOneAndUpdate(
      { lab: booking.lab, date: booking.date, time: booking.time },
      { isAvailable: true },
      { upsert: true }
    );

    booking.status = 'Cancelled';
    await booking.save();

    const User = require('../models/user'); // 🔺 Ensure you have this model
    const Notification = require('../models/notification');
    const user = await User.findById(booking.userId);
    const admins = await User.find({ role: 'admin' }); // assuming you use role field

    const adminMsg = `${user.name} has cancelled their approved booking for ${booking.lab} on ${booking.date} at ${booking.time}.`;
    for (const admin of admins) {
      await Notification.create({ userId: admin._id, message: adminMsg });
    }

    res.json({ message: 'Booking cancelled and slot released' });
  } catch (err) {
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

    // Send notification to user
    const Notification = require('../models/notification');
    const msg = `Your booking for ${booking.lab} on ${booking.date} at ${booking.time} has been approved.`;
    await Notification.create({ userId: booking.userId, message: msg });

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

    // Send rejection notification
    const Notification = require('../models/notification');
    const msg = `Your booking for ${booking.lab} on ${booking.date} at ${booking.time} was rejected. Reason: ${reason}`;
    await Notification.create({ userId: booking.userId, message: msg });

    res.json({ message: 'Booking rejected and notification sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 📌 Get all pending bookings (for Admin)
router.get('/pending', async (req, res) => {
  try {
    const pendingBookings = await Booking.find({ status: 'Pending' }).populate('userId', 'name email').sort({ requestedAt: -1 });
    res.json(pendingBookings);
  } catch (err) {
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
            const Notification = require('../models/notification');
            const existingNotification = await Notification.findOne({
              userId: recentRejection.userId,
              message: {
                $regex: `${slot.lab}.*${slot.date}.*${slot.time}`, // fuzzy check to avoid duplicates
                $options: 'i'
              }
            });
            if (!existingNotification) {
              const msg = `The previously rejected slot for ${slot.lab} on ${slot.date} at ${slot.time} is now available again. You may try booking it again if needed.`;
              await Notification.create({ userId: recentRejection.userId, message: msg });
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
      .map(b => ({ time: b.time, status: 'Approved' }));

    const pending = bookings
      .filter(b => b.status === 'Pending')
      .map(b => ({ time: b.time, userId: b.userId.toString() }));

    res.json({ booked, pending });
  } catch (err) {
    console.error('Error fetching bookings for lab and date:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


module.exports = router;
