import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  nom: { type: String, required: [true, 'Le nom est obligatoire'] },
  prenom: { type: String, required: [true, 'Le prénom est obligatoire'] },
  nin: { type: String, required: [true, 'Le NIN est obligatoire'], unique: true },
  email: { type: String, required: [true, 'L\'email est obligatoire'], unique: true, lowercase: true },
  telephone: { type: String, required: [true, 'Le téléphone est obligatoire'] },
  adresse: { type: String, required: [true, 'L\'adresse est obligatoire'] },
  codePostal: { type: String, required: [true, 'Le code postal est obligatoire'] },
  password: { type: String, required: [true, 'Le mot de passe est obligatoire'], minlength: 6, select: false },
  role: { type: String, enum: ['citoyen', 'admin', 'agent'], default: 'citoyen' },
  createdAt: { type: Date, default: Date.now }
});

userSchema.methods.crypterPassword = async function() {
  if (!this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log('Password crypté pour:', this.email);
};

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    console.log('ERREUR: Password not from DB!');
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);