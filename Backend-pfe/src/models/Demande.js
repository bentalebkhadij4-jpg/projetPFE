import mongoose from 'mongoose';

const demandeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  typeDocument: { 
    type: String, 
    required: true,
    enum: ['extrait_naissance', 'carte_sejour', 'certificat_residence', 'contrat_mariage']
  },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  nin: { type: String, required: true },
  wilayaNaissance: { type: String },
  commune:         { type: String },
  dateNaissance:   { type: Date },
  photoCniPath:     { type: String },
  photoDomicilePath:{ type: String },
  status: {
    type: String,
    enum: ['en_attente', 'en_cours', 'termine', 'refuse'],
    default: 'en_attente'
  },
  dateDemande:    { type: Date, default: Date.now },
  dateTraitement: { type: Date },
  commentaire:    { type: String }
});

export default mongoose.model('Demande', demandeSchema);