// src/models/employee.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
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
  role: {
    type: DataTypes.ENUM('admin', 'employee'),
    defaultValue: 'employee',
    allowNull: false
  },
  service: {
    type: DataTypes.STRING,
    allowNull: true
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Employee position like "main_gate", "reception", etc.'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  joinDate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    allowNull: false
  }
}, {
  tableName: 'employees',
  timestamps: true,  // Adds createdAt and updatedAt automatically
  indexes: [
    {
      fields: ['email'],
      unique: true
    },
    {
      fields: ['position']
    },
    {
      fields: ['service']
    },
    {
      fields: ['role']
    }
  ]
});

export { Employee };