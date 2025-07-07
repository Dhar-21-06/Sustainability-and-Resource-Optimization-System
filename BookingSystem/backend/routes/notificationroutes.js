const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');
const { notifyUsersBeforeSlot } = require('../controllers/notificationcontroller');

// 📥 Get all notifications by user
router.get('/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications', error: err.message });
  }
});

// ✅ Mark notification as read
router.patch('/read/:id', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ❌ Delete notification (optional)
router.delete('/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📌 Get notifications for a specific user (based on their role)
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
});

// 📌 Optional: Delete all notifications for testing/dev
router.delete('/user/:userId', async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.params.userId });
    res.json({ message: 'Notifications cleared for user' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear notifications', error: err.message });
  }
});

// for admin
router.delete('/admin/:userId', async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.params.userId, role: 'admin' });
    res.json({ message: 'Admin notifications cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear admin notifications', error: err.message });
  }
});


// 📌 GET: Admin-specific notifications
router.get('/admin/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const notifications = await Notification.find({
      userId,
      role: 'admin',
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch admin notifications', error: err.message });
  }
});

// ✅ Mark all notifications as read for a user
router.patch('/mark-as-read/:userId', async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.params.userId, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 📊 Get unread notification count for a user
router.get('/unread-count/:userId', async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.params.userId,
      read: false
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ⏰ Route to check if any user needs to be notified before slot
router.get('/pre-slot-alerts', async (req, res) => {
  try {
    const result = await notifyUsersBeforeSlot();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;