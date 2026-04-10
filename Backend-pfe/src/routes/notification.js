import express from 'express';
import { Notification } from '../models/notifications.js';

const router = express.Router();

// Get notifications for a specific employee
router.get('/employee/:id', async (req, res) => {
  try {
    const service = req.query.service;
    
    // Fetch notifications assigned to the employee or to their service
    const employeeId = req.params.id;
    const query = {
      $or: [
        { employeeId: employeeId },
        { service: service }
      ]
    };

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark a single notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    notification.isRead = true;
    await notification.save();
    
    res.json(notification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Mark all notifications as read for an employee
router.put('/employee/:id/read-all', async (req, res) => {
  try {
    const employeeId = req.params.id;
    const service = req.body.service;
    
    const query = {
      $or: [
        { employeeId: employeeId },
        { service: service, employeeId: { $ne: null } }
      ]
    };

    await Notification.updateMany(query, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Post a new notification (usually internal, but endpoint included for testing/admin)
router.post('/', async (req, res) => {
  const notification = new Notification(req.body);
  try {
    const newNotification = await notification.save();
    res.status(201).json(newNotification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
