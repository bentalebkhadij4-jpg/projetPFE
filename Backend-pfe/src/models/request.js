import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  citizen: {
    firstName: String,
    lastName: String,
    email: String,
    nin: String,
    phone: String,
    address: String,
  },
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Citizen'
  },
  subject: String,
  description: String,
  assignedTo: String,
  assignedBy: String,
  assignedEmployeeName: String,
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'rejected'],
    default: 'pending'
  },
  documentStatus: {
    type: String,
    enum: ['pending', 'valid', 'missing', 'rejected'],
    default: 'pending'
  },
  comment: { type: String, default: '' },
  notificationSent: { type: Boolean, default: false },
  notificationRead: { type: Boolean, default: false }
}, { timestamps: true });

export const Request = mongoose.model('Request', requestSchema);