import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee'
  },
  service: String,
  position: String,
  phone: String,
  joinDate: String,
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

export const Employee = mongoose.model('Employee', employeeSchema);