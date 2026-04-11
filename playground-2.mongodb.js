// ============================================================================
// TEST INSCRIPTION - Playground MongoDB VS Code
// ============================================================================

// 1. Sélectionner database
use('baladiya');

// 2. Insérer user test
db.users.insertOne({
  nom: "Test",
  prenom: "User", 
  nin: "123456789012345678",
  email: "test@test.com",
  telephone: "0555123456",
  adresse: "Alger, 16000",
  codePostal: "16000",
  password: "123456",  // Backend ghadi ycryptih
  role: "citoyen",
  biometricEnabled: false,
  createdAt: new Date()
});

// 3. Vérifier - Afficher tous les users
print("Users dans database:");
db.users.find().pretty();