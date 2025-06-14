const express = require('express');
const Booking = require('../models/Booking');
const Slot = require('../models/slot');
const router = express.Router();
const { notifyUsersAboutAvailableSlots, deleteOldNotifications } = require('../controllers/notificationcontroller');

// 📌 User requests a slot
router.post('/request', async (req, res) => {
  const { userId, lab, date, time, purpose } = req.body; // ✅ accept purpose

  try {
    const existingSlot = await Slot.findOne({ lab, date, time });

    if (existingSlot && !existingSlot.isAvailable) {
      return res.status(400).json({ message: 'Slot not available' });
    }

    await Slot.findOneAndUpdate(
      { lab, date, time },
      { isAvailable: false },
      { upsert: true }
    );

    const newBooking = new Booking({ userId, lab, date, time, purpose }); // ✅ store purpose
    await newBooking.save();

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
    const history = await Booking.find({
      userId: req.params.userId,
      status: { $in: ['Rejected', 'Cancelled'] }
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

const { notifyUsersAboutAvailableSlots, deleteOldNotifications } = require('../controllers/notificationcontroller');

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


module.exports = router;
