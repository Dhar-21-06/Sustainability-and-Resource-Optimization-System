const Booking = require('../models/bookings');

const markCompletedBookings = async () => {
  const now = new Date();

  try {
    const bookings = await Booking.find({ status: 'Approved' });

    let completed = 0;

    for (const booking of bookings) {
      if (booking.date && booking.time) {
        const [startTime] = booking.time.split('-'); // only use start time
        const slotDateTime = new Date(`${booking.date}T${startTime.trim()}:00`);

        if (!isNaN(slotDateTime.getTime()) && slotDateTime < now) {
          booking.status = 'Completed';
          await booking.save();
          completed++;
        }
      }
    }
    return { completed };
  } catch (err) {
    console.error('❌ Error marking bookings as Completed:', err.message);
  }
};

module.exports = markCompletedBookings;
