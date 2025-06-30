const Booking = require('../models/bookings');
const Notification = require('../models/notification');
const User = require('../models/user');

const rejectExpiredPendingBookings = async () => {
  const now = new Date();
  const pending = await Booking.find({ status: 'Pending' });
  let count = 0;

  for (const booking of pending) {
    try {
      const [startHour, startMinute] = booking.time.split('-')[0].split(':');
      const slotStart = new Date(booking.date);
      slotStart.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

      const expiry = new Date(slotStart.getTime() + 30 * 60 * 1000); // 30 mins after slot starts

      if (now > expiry) {
        booking.status = 'Rejected';
        booking.rejectionTimestamp = now;
        booking.rejectionReason = "Slot expired without approval";
        await booking.save();
        count++;

        const user = await User.findById(booking.userId);
        if (user) {
          await Notification.create({
            userId: user._id,
            role: 'faculty',
            message: `❌ Your booking for ${booking.lab} on ${booking.date} at ${booking.time} was auto-rejected since it was not approved in time.`,
            link: `/user/bookings#history?highlight=${booking._id}`,
            bookingId: booking._id
          });
        }
      }
    } catch (err) {
      console.error(`⛔ Error processing booking ${booking._id}:`, err.message);
    }
  }

  return { count };
};

module.exports = rejectExpiredPendingBookings;