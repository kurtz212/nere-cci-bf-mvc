// ─────────────────────────────────────────────────────────────
//  Route à ajouter dans ton fichier de routes publications
//  (ex: routes/publications.js ou routes/publicationRoutes.js)
// ─────────────────────────────────────────────────────────────
//
//  POST /api/publications/:id/vue
//  Incrémente le compteur de vues d'une publication.
//  Accessible sans authentification (visiteurs comptent aussi).
// ─────────────────────────────────────────────────────────────

const express = require("express");
const router  = express.Router();
const Publication = require("../models/Publication"); // adapte le chemin selon ton projet

// ── Incrémenter les vues ──────────────────────────────────────
router.post("/:id/vue", async (req, res) => {
  try {
    const pub = await Publication.findByIdAndUpdate(
      req.params.id,
      { $inc: { vues: 1 } },   // $inc est atomique → pas de race condition
      { new: true }             // retourne le document mis à jour
    );

    if (!pub) {
      return res.status(404).json({ success: false, message: "Publication introuvable." });
    }

    return res.json({ success: true, vues: pub.vues });
  } catch (err) {
    console.error("Erreur incrément vues :", err);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// ── S'assurer que le champ `vues` existe dans ton modèle Mongoose ──
//
// Dans models/Publication.js, ajoute ce champ si absent :
//
//   vues: {
//     type: Number,
//     default: 0,
//   },
//
// Exemple de schéma minimal :
//
//   const PublicationSchema = new mongoose.Schema({
//     titre:     { type: String, required: true },
//     contenu:   { type: String },
//     extrait:   { type: String },
//     categorie: { type: String },
//     statut:    { type: String, default: "brouillon" },
//     accesPack: { type: Number, default: 1 },
//     tags:      [String],
//     vues:      { type: Number, default: 0 },   // ← ajouter ceci
//   }, { timestamps: true });

module.exports = router;

// ─────────────────────────────────────────────────────────────
//  Dans app.js / server.js, enregistre la route :
//
//   const publicationsRouter = require("./routes/publications");
//   app.use("/api/publications", publicationsRouter);
//
// ─────────────────────────────────────────────────────────────