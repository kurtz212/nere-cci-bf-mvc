// server/seed-gestionnaire.js
// Exécuter : node seed-gestionnaire.js
// Crée un compte gestionnaire de test si inexistant

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nere-cci-bf';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connecté');

  // Charger le modèle User
  const User = require('./src/models/User.model');

  // Vérifier si un gestionnaire existe déjà
  const existing = await User.findOne({ role: 'manager' });
  if (existing) {
    console.log(`ℹ️  Gestionnaire existant : ${existing.email} (role: ${existing.role}, isActive: ${existing.isActive}, emailVerified: ${existing.emailVerified})`);
    
    // S'assurer que le compte est actif et vérifié
    await User.findByIdAndUpdate(existing._id, {
      isActive:       true,
      emailVerified:  true,
      suspendJusquau: null,
      raisonSuspension: '',
    });
    console.log('✅ Compte gestionnaire existant réactivé et vérifié');
  } else {
    // Créer un gestionnaire de test
    const hash = await bcrypt.hash('Gestionnaire1234', 12);
    const user = await User.create({
      nom:           'Gestionnaire',
      prenom:        'NERE',
      email:         'gestionnaire@nere.bf',
      password:      hash,
      role:          'manager',
      isActive:      true,
      emailVerified: true,
      typeCompte:    'administration',
    });
    console.log(`✅ Gestionnaire créé : ${user.email}`);
    console.log('   Email    : gestionnaire@nere.bf');
    console.log('   Password : Gestionnaire1234');
  }

  // Lister tous les gestionnaires
  const managers = await User.find({ role: 'manager' }).select('email isActive emailVerified suspendJusquau');
  console.log('\n📋 Tous les gestionnaires :');
  managers.forEach(m => {
    const susp = m.suspendJusquau ? ` | suspendu jusqu'au ${new Date(m.suspendJusquau).toLocaleDateString('fr-FR')}` : '';
    console.log(`  - ${m.email} | actif: ${m.isActive} | vérifié: ${m.emailVerified}${susp}`);
  });

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});