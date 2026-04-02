// ── seed-packs.js ──
// Exécuter avec : node seed-packs.js
// Depuis le dossier : server/

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const PACKS = [
  {
    nom: 'Standard',
    options: [
      {
        niveau: 1,
        label: 'Essentiel',
        prix: 5000,
        dureeJours: 365,
        searchesLimit: 500,
        canExport: false,
        canAdvancedSearch: false,
        description: 'Accès aux listes simples d\'entreprises'
      },
      {
        niveau: 2,
        label: 'Professionnel',
        prix: 10000,
        dureeJours: 365,
        searchesLimit: 2000,
        canExport: true,
        canAdvancedSearch: true,
        description: 'Accès aux listes, fiches et recherche avancée'
      },
      {
        niveau: 3,
        label: 'Entreprise',
        prix: 15000,
        dureeJours: 365,
        searchesLimit: -1,
        canExport: true,
        canAdvancedSearch: true,
        description: 'Accès illimité à toutes les données NERE'
      }
    ],
    isActive: true
  }
];

const PackSchema = new mongoose.Schema({
  nom: String,
  options: [{
    niveau: Number,
    label: String,
    prix: Number,
    dureeJours: Number,
    searchesLimit: Number,
    canExport: Boolean,
    canAdvancedSearch: Boolean,
    description: String
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

async function seed() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nere-cci-bf';
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connecté');

    const Pack = mongoose.model('Pack', PackSchema);

    // Supprimer les anciens packs
    await Pack.deleteMany({});
    console.log('🗑️  Anciens packs supprimés');

    // Insérer les nouveaux
    const inserted = await Pack.insertMany(PACKS);
    console.log(`✅ ${inserted.length} pack(s) inséré(s) :`);
    inserted.forEach(p => {
      console.log(`   - ${p.nom}`);
      p.options.forEach(opt => {
        console.log(`      • ${opt.label} (Niveau ${opt.niveau}) — ${opt.prix.toLocaleString()} FCFA`);
      });
    });

    await mongoose.disconnect();
    console.log('✅ Terminé !');
    process.exit(0);
  } catch(err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

seed();
