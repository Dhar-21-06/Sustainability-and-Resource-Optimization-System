const Booking = require('../models/bookings');
const Slot = require('../models/slot');
const Notification = require('../models/notification');
const User = require("../models/user");
const Profile = require("../models/profile"); 

/**
 * Notify users if their previously rejected slot is now available
 */
const notifyUsersAboutAvailableSlots = async () => {
  try {
    const rejectedBookings = await Booking.find({ status: 'Rejected' });

    for (const booking of rejectedBookings) {
      const { lab, date, time, rejectionTimestamp, userId, _id } = booking;

      // Check if 24 hours have passed
      if (!rejectionTimestamp) continue;

      const blockedUntil = new Date(rejectionTimestamp);
      blockedUntil.setHours(blockedUntil.getHours() + 24);

      if (new Date() > blockedUntil) {
        // Check if slot is available now
        const slot = await Slot.findOne({ lab, date, time });
        if (slot && slot.isAvailable) {
  // Check if already notified
  const alreadyNotified = await Notification.findOne({
    userId,
    message: { $regex: `Slot ${lab} on ${date} at ${time} is now available` }
  });

  if (!alreadyNotified) {
    const message = `The slot you were rejected for (${lab} on ${date} at ${time}) is now available! You can try booking again.`;
    
    // Notify faculty user
    await Notification.create({ userId, message, role: 'faculty' });

const adminProfiles = await Profile.find({ role: "admin", labIncharge: lab });

for (const profile of adminProfiles) {
  const adminUser = await User.findOne({ email: profile.email });
  if (adminUser) {
    await Notification.create({
      userId: adminUser._id,
      message: `Faculty user with ID ${userId} can now rebook the available slot for ${lab} on ${date} at ${time}.`,
      role: 'admin'
    });
  }
 else {
      console.error("Admin user not found");
    }
  }
}
}

      }
    }

    return { success: true, message: 'Notifications checked and sent' };
  } catch (err) {
    console.error('Error in notifyUsersAboutAvailableSlots:', err.message);
    throw new Error('Server error while notifying available slots');
  }
};

/**
 * Delete notifications older than 7 days
 */
const deleteOldNotifications = async () => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    const result = await Notification.deleteMany({ timestamp: { $lt: cutoff } });
    return { success: true, deleted: result.deletedCount };
  } catch (err) {
    console.error('Error in deleteOldNotifications:', err.message);
    throw new Error('Server error while cleaning notifications');
  }
};

/**
 * Notify users 30 minutes before their approved booking starts
 */
const notifyUsersBeforeSlot = async () => {
  try {
    const now = new Date();
    const in30Min = new Date(now.getTime() + 30 * 60000); // 30 minutes from now

    const bookings = await Booking.find({
      status: 'Approved'
    }).populate('userId', 'name');

    for (const booking of bookings) {
      const slotTime = new Date(`${booking.date}T${booking.time}`);
      
      // Check if slot is ~30 minutes from now (±1 minute buffer)
      const diff = Math.abs(slotTime - in30Min) / 1000 / 60; // difference in minutes

      if (diff <= 1) {
        // Check if notification already sent
        const existing = await Notification.findOne({
          userId: booking.userId._id,
          message: {
            $regex: `booking at ${booking.lab} on ${booking.date} at ${booking.time} begins in 30 minutes`,
            $options: 'i'
          }
        });

        if (!existing) {
          const msg = `🔔 Hi ${booking.userId.name}, Your lab booking at ${booking.lab} on ${booking.date} at ${booking.time} begins in 30 minutes.`;

          await Notification.create({
            userId: booking.userId._id,
            message: msg,
            role: 'faculty',
            link: '/user/bookings#current'
          });
        }
      }
    }

    return { success: true, message: 'Pre-slot notifications sent' };
  } catch (err) {
    console.error("❌ Error in notifyUsersBeforeSlot:", err.message);
    throw new Error("Failed to notify users before their slot");
  }
};

module.exports = { notifyUsersAboutAvailableSlots, deleteOldNotifications, notifyUsersBeforeSlot };