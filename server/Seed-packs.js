// ── seed-packs.js ──
// Exécuter avec : node seed-packs.js
// Depuis le dossier : server/

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

// ── Schéma identique à votre route /api/packs ──
const PackSchema = new mongoose.Schema({
  nom:     String,
  options: [{
    niveau:           Number,
    label:            String,
    prix:             Number,
    dureeJours:       Number,
    searchesLimit:    Number,
    canExport:        Boolean,
    canAdvancedSearch:Boolean,
    description:      String,
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// ── Données à insérer — modifiez les prix ici ──
const PACKS = [
  {
    nom: 'Standard',
    isActive: true,
    options: [
      {
        niveau:            1,
        label:             'Pack 1',
        prix:              5000,       // ← modifiez ici
        dureeJours:        365,
        searchesLimit:     500,
        canExport:         false,
        canAdvancedSearch: false,
        description:       'Créditez votre compte avec 5 000 FCFA. Déduction directe à chaque requête.',
      },
      {
        niveau:            2,
        label:             'Pack 2',
        prix:              10000,      // ← modifiez ici
        dureeJours:        365,
        searchesLimit:     2000,
        canExport:         true,
        canAdvancedSearch: true,
        description:       'Créditez votre compte avec 10 000 FCFA. Déduction directe à chaque requête.',
      },
      {
        niveau:            3,
        label:             'Pack 3',
        prix:              15000,      // ← modifiez ici (montant minimum)
        dureeJours:        365,
        searchesLimit:     -1,         // -1 = illimité
        canExport:         true,
        canAdvancedSearch: true,
        description:       'Créditez votre compte avec un montant personnalisé. Déduction directe à chaque requête.',
      },
    ],
  },
];

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