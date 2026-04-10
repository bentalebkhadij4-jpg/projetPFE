import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Employee } from '../models/employee.js';

const router = express.Router();

// GET all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find({}).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    if (employee.status === 'inactive') {
      return res.status(401).json({ message: 'Account is inactive' });
    }
    
    const token = jwt.sign(
      { id: employee._id, email: employee.email, role: employee.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );
    
    res.json({
      token,
      user: {
        id: employee._id,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        role: employee.role,
        service: employee.service,
        position: employee.position,
        phone: employee.phone,
        joinDate: employee.joinDate,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE employee (admin only)
router.post('/', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, service, position, phone, joinDate } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const employee = new Employee({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      service,
      position,
      phone,
      joinDate,
      status: 'active'
    });
    
    const created = await employee.save();
    res.status(201).json({
      id: created._id,
      email: created.email,
      firstName: created.firstName,
      lastName: created.lastName,
      role: created.role,
      service: created.service,
      position: created.position,
      phone: created.phone,
      joinDate: created.joinDate,
      status: created.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;