// src/models/Citizen.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Citizen = sequelize.define('Citizen', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nin: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
    comment: 'National Identification Number'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'citizens',
  timestamps: true,  // Adds createdAt and updatedAt automatically
  indexes: [
    {
      fields: ['nin'],
      unique: true
    },
    {
      fields: ['email']
    },
    {
      fields: ['phone']
    }
  ]
});

export { Citizen };