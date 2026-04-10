import express from 'express';
import { Request } from '../models/request.js';
import { Employee } from '../models/employee.js';

const router = express.Router();

const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'admin123'
};

// Connexion admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('\n=== TENTATIVE CONNEXION ADMIN ===');
    console.log('Email:', email);
    
    if (email !== ADMIN_CREDENTIALS.email) {
      console.log(' Email admin incorrect');
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }
    
    if (password !== ADMIN_CREDENTIALS.password) {
      console.log(' Mot de passe admin incorrect');
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }
    
    console.log(' Admin connecté');
    
    res.json({
      message: 'Connexion admin réussie',
      user: {
        id: 'admin',
        email: ADMIN_CREDENTIALS.email,
        firstName: 'Administrateur',
        lastName: '',
        name: 'Administrateur',
        role: 'admin',
        service: 'Administration',
        position: 'Administrateur Système',
        phone: '',
        joinDate: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Erreur login admin:', error);
    res.status(500).json({ message: error.message });
  }
});

// Récupérer tous les employés (admin uniquement)
router.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find({}).select('-password');
    
    console.log(`\n Admin: ${employees.length} employés trouvés`);
    
    res.json({
      count: employees.length,
      employees: employees
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer toutes les demandes (admin uniquement)
router.get('/all-requests', async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    
    console.log(`\n Admin: ${requests.length} demandes trouvées`);
    
    res.json({
      count: requests.length,
      requests: requests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer les statistiques (admin uniquement)
router.get('/stats', async (req, res) => {
  try {
    const total = await Request.countDocuments();
    const pending = await Request.countDocuments({ status: 'pending' });
    const completed = await Request.countDocuments({ status: 'completed' });
    const rejected = await Request.countDocuments({ status: 'rejected' });
    
    console.log('\n Statistiques admin:');
    console.log(`  Total: ${total} | En attente: ${pending} | Terminé: ${completed} | Rejeté: ${rejected}`);
    
    res.json({
      total,
      pending,
      completed,
      rejected
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;