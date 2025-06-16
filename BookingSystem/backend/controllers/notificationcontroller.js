const Booking = require('../models/bookings');
const Slot = require('../models/slot');
const Notification = require('../models/notification');

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
            await Notification.create({ userId, message });
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

module.exports = { notifyUsersAboutAvailableSlots, deleteOldNotifications };