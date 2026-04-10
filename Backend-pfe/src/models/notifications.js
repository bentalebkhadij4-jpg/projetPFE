import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String, // e.g., 'appointment', 'document_update', 'system'
    required: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: false // If null, it's a broadcast or relevant to a service
  },
  service: {
    type: String,
    required: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

export const Notification = mongoose.model('Notification', notificationSchema);
