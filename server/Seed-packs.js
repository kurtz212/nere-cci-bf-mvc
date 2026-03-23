// ── seed-packs.js ──
// Exécuter avec : node seed-packs.js
// Depuis le dossier : server/

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const PACKS = [
  {
    nom:         'Basic',
    niveau:      1,
    description: 'Accès aux listes simples d\'entreprises',
    prix: {
      mensuel: 5000,
      annuel:  50000,
    },
    quotas: {
      listes:       500,
      fiches:       0,
      statistiques: 0,
    },
    fonctionnalites: [
      'Recherche simple (nom, ville)',
      '500 listes / an',
      'Publications publiques',
      'Résultats basiques',
    ],
    nonInclus: [
      'Recherche avancée',
      'Export PDF/Excel',
      'Données financières',
      'Fiches entreprises',
      'Statistiques',
    ],
    actif: true,
  },
  {
    nom:         'Pro',
    niveau:      2,
    description: 'Accès aux listes, fiches et recherche avancée',
    prix: {
      mensuel: 15000,
      annuel:  150000,
    },
    quotas: {
      listes:       2000,
      fiches:       50,
      statistiques: 0,
    },
    fonctionnalites: [
      'Tout le pack Basic',
      'Recherche avancée multi-critères',
      '2 000 listes / an',
      '50 fiches / an',
      'Export PDF et Excel',
      'Données financières partielles',
    ],
    nonInclus: [
      'Recherches illimitées',
      'Statistiques',
      'Données complètes',
    ],
    recommande: true,
    actif: true,
  },
  {
    nom:         'Premium',
    niveau:      3,
    description: 'Accès illimité à toutes les données NERE',
    prix: {
      mensuel: 35000,
      annuel:  350000,
    },
    quotas: {
      listes:       -1, // illimité
      fiches:       -1,
      statistiques: -1,
    },
    fonctionnalites: [
      'Tout le pack Pro',
      'Recherches illimitées',
      'Données financières complètes',
      'Statistiques import/export',
      'Toutes les publications',
      'Support prioritaire',
    ],
    nonInclus: [],
    actif: true,
  },
];

const PackSchema = new mongoose.Schema({
  nom:             String,
  niveau:          Number,
  description:     String,
  prix:            { mensuel: Number, annuel: Number },
  quotas:          { listes: Number, fiches: Number, statistiques: Number },
  fonctionnalites: [String],
  nonInclus:       [String],
  recommande:      { type: Boolean, default: false },
  actif:           { type: Boolean, default: true },
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
    console.log(`✅ ${inserted.length} packs insérés :`);
    inserted.forEach(p => {
      console.log(`   - ${p.nom} (niveau ${p.niveau}) — ${p.prix.mensuel.toLocaleString()} FCFA/mois`);
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