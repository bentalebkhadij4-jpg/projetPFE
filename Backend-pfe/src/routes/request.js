import express from 'express';
import { Request } from '../models/request.js';
import { emailService, initializeEmail } from './emailServices.js';
import { PDFService } from './pdfservice.js';

const router = express.Router();
let testAccountSetup = false;

const employees = {
  '1': { id: '1', name: 'Sarah', email: 'sarah@gmail.com', service: 'Carte de séjour' },
  '2': { id: '2', name: 'Jamel', email: 'jamel@gmail.com', service: 'Certificat de résidence' },
  '3': { id: '3', name: 'Emma', email: 'emma@gmail.com', service: 'Acte de naissance' },
  '4': { id: '4', name: 'Lisa', email: 'lisa@gmail.com', service: 'Certificat de mariage' }
};

const EMPLOYEE_PASSWORD = 'employee123';

console.log('\n=== EMPLOYÉS ENREGISTRÉS ===');
Object.values(employees).forEach(emp => {
  console.log(`${emp.name}: ${emp.email} / ${EMPLOYEE_PASSWORD} (${emp.service})`);
});
console.log('============================\n');

// Submit request
router.post('/submit', async (req, res) => {
  try {
    if (!testAccountSetup) {
      await initializeEmail();
      testAccountSetup = true;
    }

    const { citizenData, subject, description, serviceType } = req.body;
    console.log('\n=== NOUVELLE DEMANDE ===');
    console.log('Citoyen:', citizenData.firstName, citizenData.lastName);
    
    let assignedEmployee = employees['2'];
    const serviceLower = (serviceType || '').toLowerCase();
    
    if (serviceLower.includes('carte') || serviceLower.includes('séjour')) {
      assignedEmployee = employees['1'];
    } else if (serviceLower.includes('état') || serviceLower.includes('civil')) {
      assignedEmployee = employees['2'];
    } else if (serviceLower.includes('passeport')) {
      assignedEmployee = employees['3'];
    } else if (serviceLower.includes('naissance')) {
      assignedEmployee = employees['4'];
    }
    
    console.log(`Assigné à: ${assignedEmployee.name}`);

    const newRequest = new Request({
      citizen: citizenData,
      subject,
      description,
      serviceType: serviceType || 'Non spécifié',
      assignedTo: assignedEmployee.id,
      assignedToName: assignedEmployee.name,
      assignedToEmail: assignedEmployee.email,
      status: 'pending',
    });
    
    await newRequest.save();
    console.log('Demande enregistrée:', newRequest._id);
    
    try {
      await emailService.sendEmployeeNotification(
        assignedEmployee.email,
        assignedEmployee.name,
        `${citizenData.firstName} ${citizenData.lastName}`,
        subject,
        serviceType
      );
    } catch (emailError) {
      console.error('Email failed:', emailError.message);
    }
    
    res.status(201).json({
      message: 'Demande soumise avec succès',
      requestId: newRequest._id,
      assignedTo: assignedEmployee
    });
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});

// Employee login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (password !== EMPLOYEE_PASSWORD) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }
    
    const employee = Object.values(employees).find(emp => emp.email === email);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    
    console.log(`\n Connexion: ${employee.name}`);
    
    res.json({
      message: 'Connexion réussie',
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        service: employee.service
      }
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my requests
router.get('/my-requests/:employeeId', async (req, res) => {
  try {
    const requests = await Request.find({ assignedTo: req.params.employeeId })
      .sort({ createdAt: -1 });
    
    res.json({
      count: requests.length,
      requests: requests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single request
router.get('/request/:requestId', async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Validate with PDF
router.put('/validate-with-pdf/:requestId', async (req, res) => {
  try {
    const { status, documentStatus, comment, employeeId } = req.body;
    
    const request = await Request.findByIdAndUpdate(
      req.params.requestId,
      { status, documentStatus, validatedBy: employeeId, validationDate: new Date(), comment },
      { new: true }
    );
    
    if (!request) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    
    const employee = employees[employeeId];
    console.log('\n=== VALIDATION ===');
    console.log('Demande:', request._id);
    console.log('Statut:', status);
    
    let pdfBuffer = null;
    try {
      pdfBuffer = await PDFService.generateCitizenPDF(request.citizen, request);
      console.log('PDF généré:', pdfBuffer.length, 'bytes');
    } catch (pdfError) {
      console.error(' PDF Error:', pdfError.message);
    }
    
    let emailSent = false;
    if ((status === 'completed' || status === 'rejected') && pdfBuffer) {
      try {
        await emailService.sendValidationEmailWithPDF(
          request.citizen.email,
          request.citizen.firstName,
          request.subject,
          status,
          employee?.name || 'Service municipal',
          comment,
          pdfBuffer
        );
        emailSent = true;
        console.log(' Email envoyé');
      } catch (emailError) {
        console.error(' Email Error:', emailError.message);
      }
    }
    
    res.json({
      message: 'Demande traitée',
      request,
      pdfGenerated: !!pdfBuffer,
      emailSent
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download PDF
router.get('/download-pdf/:requestId', async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    
    const pdfBuffer = await PDFService.generateCitizenPDF(request.citizen, request);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=demande-${request._id}.pdf`);
    res.send(pdfBuffer);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;