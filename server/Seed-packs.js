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
    niveau:            Number,
    label:             String,
    prix:              Number,
    prixMax:           Number,   // pour le Pack Pro : montant max
    dureeJours:        Number,
    searchesLimit:     Number,
    canExport:         Boolean,
    canAdvancedSearch: Boolean,
    canPublicationsNiveau: Number, // 0=communiqués, 1=+notes+classements, 2=tout
    description:       String,
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

/* ══════════════════════════════════════════
   RÈGLES D'ACCÈS PAR PACK

   Pack Essentiel     (solde = 5 000 FCFA exactement)
   → Recherche multicritère
   → Demandes de données (listes, fiches, stats)
   → Chat avec agents CCI-BF
   → Publications : Communiqués uniquement
   → Pas de téléchargement PDF

   Pack Professionnel (5 001 ≤ solde ≤ 14 999 FCFA)
   → Tout le Pack Essentiel
   → Publications : + Notes techniques + Classements
   → Téléchargement PDF

   Pack Entreprise    (solde ≥ 15 000 FCFA)
   → Tout le Pack Professionnel
   → Publications : + Rapports + Études (accès complet)
   → Téléchargement PDF
══════════════════════════════════════════ */
const PACKS = [
  {
    nom:      'Standard',
    isActive: true,
    options:  [
      {
        niveau:                1,
        label:                 'Pack Essentiel',
        prix:                  5000,
        prixMax:               5000,
        dureeJours:            365,
        searchesLimit:         500,
        canExport:             false,
        canAdvancedSearch:     true,
        canPublicationsNiveau: 0,   // Communiqués uniquement
        description:           'Créditez votre compte avec exactement 5 000 FCFA. ' +
                               'Accès aux communiqués, recherche multicritère, demandes de données et chat CCI-BF.',
      },
      {
        niveau:                2,
        label:                 'Pack Professionnel',
        prix:                  5001,
        prixMax:               14999,
        dureeJours:            365,
        searchesLimit:         2000,
        canExport:             true,
        canAdvancedSearch:     true,
        canPublicationsNiveau: 1,   // Communiqués + Notes techniques + Classements + PDF
        description:           'Créditez votre compte entre 5 001 et 14 999 FCFA. ' +
                               'Accès étendu aux publications : notes techniques, classements et téléchargement PDF.',
      },
      {
        niveau:                3,
        label:                 'Pack Entreprise',
        prix:                  15000,
        prixMax:               null, // illimité
        dureeJours:            365,
        searchesLimit:         -1,   // illimité
        canExport:             true,
        canAdvancedSearch:     true,
        canPublicationsNiveau: 2,   // Tout débloquer : Rapports + Études + PDF
        description:           'Créditez votre compte avec 15 000 FCFA ou plus. ' +
                               'Accès complet à toute la plateforme : rapports, études, et toutes les publications.',
      },
    ],
  },
];

async function seed() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nere-cci-bf';
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connecté');
    console.log('   Base :', mongoose.connection.db.databaseName);

    const Pack = mongoose.model('Pack', PackSchema);

    // Supprimer les anciens packs
    await Pack.deleteMany({});
    console.log('🗑️  Anciens packs supprimés');

    // Insérer les nouveaux
    const inserted = await Pack.insertMany(PACKS);
    console.log(`✅ ${inserted.length} pack(s) inséré(s) :\n`);

    inserted.forEach(p => {
      console.log(`   📦 ${p.nom}`);
      p.options.forEach(opt => {
        const prixLabel = opt.prixMax
          ? opt.prix === opt.prixMax
            ? `${opt.prix.toLocaleString('fr-FR')} FCFA`
            : `${opt.prix.toLocaleString('fr-FR')} – ${opt.prixMax.toLocaleString('fr-FR')} FCFA`
          : `${opt.prix.toLocaleString('fr-FR')} FCFA et plus`;

        const pubLabel = opt.canPublicationsNiveau === 0
          ? 'Communiqués'
          : opt.canPublicationsNiveau === 1
          ? 'Communiqués + Notes + Classements + PDF'
          : 'Accès complet (Rapports + Études + PDF)';

        console.log(`      • ${opt.label} (Niveau ${opt.niveau})`);
        console.log(`        Prix    : ${prixLabel}`);
        console.log(`        Pubs    : ${pubLabel}`);
        console.log(`        Export  : ${opt.canExport ? 'Oui' : 'Non'}`);
        console.log(`        Searches: ${opt.searchesLimit === -1 ? 'Illimité' : opt.searchesLimit}`);
        console.log('');
      });
    });

    await mongoose.disconnect();
    console.log('✅ Terminé ! Les packs sont à jour dans MongoDB.');
    process.exit(0);

  } catch(err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

seed();