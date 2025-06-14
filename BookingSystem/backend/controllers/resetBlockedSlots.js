const Booking = require('../models/bookings');
const Slot = require('../models/slot');

async function resetBlockedSlots() {
  try {
    const blockedSlots = await Slot.find({ isAvailable: false });

    for (const slot of blockedSlots) {
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
          slot.isAvailable = true;
          await slot.save();
          console.log(`[Unblocked] ${slot.lab} on ${slot.date} at ${slot.time}`);
        }
      }
    }
  } catch (err) {
    console.error('❌ Error in resetting blocked slots:', err.message);
  }
}

module.exports = resetBlockedSlots;
