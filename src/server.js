// src/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import sequelize from './config/database.js';
import notificationRoutes from './routes/notification.js';

// Import your existing routes
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/admin.js';
import demandeRoutes from './routes/demandeRoutes.js';
import employeeRoutes from './routes/employee.js';
import requestRoutes from './routes/request.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/demandes', demandeRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/requests', requestRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API is running with PostgreSQL' });
});

// Start server
async function startServer() {
  try {
    // Connect to PostgreSQL
    await sequelize.authenticate();
    console.log(' PostgreSQL connected successfully');
    
    // Sync all PostgreSQL models
    await sequelize.sync({ alter: true });
    console.log(' All PostgreSQL models synced');

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('\n Notification endpoints (using POSITION):');
      console.log('  POST   /api/notifications/send-by-position');
      console.log('  GET    /api/notifications/position/:position');
      console.log('  GET    /api/notifications/all');
      console.log('  PUT    /api/notifications/:uuid/read');
      console.log('  DELETE /api/notifications/position/:position');
    });
  } catch (error) {
    console.error(' Error starting server:', error.message);
  }
}

startServer();