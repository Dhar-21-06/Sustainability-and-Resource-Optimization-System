const express = require('express');
const Notification = require('../models/notification');
const router = express.Router();

// 📌 Get notifications for faculty
router.get('/user/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      userId: req.params.userId, 
      role: 'faculty' 
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 📌 Get notifications for admin
router.get('/admin/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      userId: req.params.userId, 
      role: 'admin' 
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 📌 Get all notifications for a user
// 📌 Mark a notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 📌 Delete a single notification
router.delete('/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 📌 Delete all notifications for a user
router.delete('/user/:userId', async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.params.userId });
    res.json({ message: 'All notifications for the user deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Send new notification
router.post('/', async (req, res) => {
  const { userId, message, role } = req.body;
  try {
    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }
    const newNotification = new Notification({ userId, message, role });
    await newNotification.save();
    res.status(201).json({ message: 'Notification sent', notification: newNotification });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
