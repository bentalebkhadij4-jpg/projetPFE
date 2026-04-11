// src/config/database.js
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('notification_db', 'postgres', '123', {
  host: 'localhost',
  dialect: 'postgresql',
  port: 5000,
  logging: false
});

export default sequelize;