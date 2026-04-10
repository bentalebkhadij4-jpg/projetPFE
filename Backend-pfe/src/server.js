import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import employeeRoutes from './routes/employee.js';
import requestRoutes from './routes/request.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notification.js';
import authRoutes from './routes/authRoutes.js';
import demandeRoutes from './routes/demandeRoutes.js';

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────

// CORS (allow all for development)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── MongoDB Connection ─────────────────────────────────────

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB connecté`);
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

// Connect to DB
connectDB();

// ── Routes ────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend good!' });
});

// Auth & demandes
app.use('/api/auth', authRoutes);
app.use('/api/demandes', demandeRoutes);

// Employee management
app.use('/api/employees', employeeRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// ── Global error handler ──────────────────────────────────

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

// ── Start server ──────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 Server running on:');
  console.log(`👉 Local:   http://localhost:${PORT}`);
  console.log(`👉 API:     http://localhost:${PORT}/api\n`);

  console.log('👨‍💼 EMPLOYÉS:');
  console.log('  Sarah:  sarah@gmail.com  / employee123');
  console.log('  Jamel:  jamel@gmail.com  / employee123');
  console.log('  Fatima: fatima@gmail.com / employee123');
  console.log('  Maria:  maria@gmail.com  / employee123\n');

  console.log('👨‍💻 ADMIN:');
  console.log('  admin@gmail.com / admin123\n');
});

export default app;