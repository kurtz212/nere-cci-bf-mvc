// ─────────────────────────────────────────────────────────────
//  Route à ajouter dans ton fichier routes/abonnements.js
//  (ou le fichier qui gère les routes /api/abonnements/...)
// ─────────────────────────────────────────────────────────────

// ── GET /api/abonnements/historique ──────────────────────────
// Retourne l'historique des transactions (recharges + déductions)
// de l'utilisateur connecté, du plus récent au plus ancien.

router.get("/historique", authMiddleware, async (req, res) => {
  try {
    // Option A — si tu as un modèle Transaction ou Abonnement dédié :
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({
      success: true,
      data: transactions.map(t => ({
        _id:         t._id,
        type:        t.montant >= 0 ? "recharge" : "deduction",
        montant:     t.montant,           // positif = recharge, négatif = déduction
        description: t.description || (t.montant >= 0 ? "Recharge" : "Déduction"),
        reference:   t.reference || null,
        soldeApres:  t.soldeApres || null,
        createdAt:   t.createdAt,
      })),
    });

    // ─────────────────────────────────────────────────────────
    // Option B — si les transactions sont dans le modèle Abonnement
    // (champ 'historique' ou 'transactions' sous forme de tableau) :
    //
    // const abo = await Abonnement.findOne({ user: req.user._id });
    // if (!abo) return res.json({ success: true, data: [] });
    //
    // const data = (abo.historique || abo.transactions || [])
    //   .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    //   .map(t => ({
    //     _id:         t._id,
    //     type:        t.montant >= 0 ? "recharge" : "deduction",
    //     montant:     t.montant,
    //     description: t.description || (t.montant >= 0 ? "Recharge" : "Déduction"),
    //     soldeApres:  t.soldeApres || null,
    //     createdAt:   t.createdAt || t.date,
    //   }));
    //
    // return res.json({ success: true, data });
    // ─────────────────────────────────────────────────────────

  } catch (err) {
    console.error("Erreur historique abonnement :", err);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// ─────────────────────────────────────────────────────────────
//  Structure attendue par le frontend pour chaque transaction :
//
//  {
//    _id:         string,         // identifiant MongoDB
//    type:        "recharge" | "deduction",
//    montant:     number,         // positif = recharge, négatif = déduction
//    description: string,         // ex: "Recharge Orange Money", "Requête Liste"
//    reference:   string | null,  // numéro de transaction optionnel
//    soldeApres:  number | null,  // solde après cette transaction
//    createdAt:   Date | string,  // date de la transaction
//  }
// ─────────────────────────────────────────────────────────────