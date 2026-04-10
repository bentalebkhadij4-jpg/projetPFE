import mongoose from 'mongoose';

const citizenSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  nin: {
    type: String,
    unique: true
  },
  email: String,
  phone: String,
}, {
  timestamps: true
});

export const Citizen = mongoose.model('Citizen', citizenSchema);