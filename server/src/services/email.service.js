const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ── Template HTML de base ──
const templateBase = (contenu) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
    .header { background: #1B2A4A; padding: 24px; text-align: center; }
    .header h1 { color: #E8A020; font-size: 20px; margin: 0; }
    .body { padding: 28px; color: #333; line-height: 1.7; }
    .btn { display: inline-block; padding: 12px 28px; background: #E8A020; color: #1B2A4A;
           font-weight: bold; text-decoration: none; border-radius: 6px; margin: 16px 0; }
    .footer { background: #f4f6fb; padding: 16px; text-align: center; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>NERE · CCI-BF</h1></div>
    <div class="body">${contenu}</div>
    <div class="footer">© 2025 Chambre de Commerce et d'Industrie du Burkina Faso</div>
  </div>
</body>
</html>`;

// ── Email de vérification ──
exports.envoyerEmailVerification = async (user, lien) => {
  const html = templateBase(`
    <p>Bonjour <strong>${user.prenom} ${user.nom}</strong>,</p>
    <p>Merci de vous être inscrit sur la plateforme NERE de la CCI-BF.</p>
    <p>Cliquez sur le bouton ci-dessous pour activer votre compte :</p>
    <a href="${lien}" class="btn">Activer mon compte</a>
    <p style="color:#888;font-size:12px;">Ce lien expire dans 24h.</p>
  `);

  await transporter.sendMail({
    from: `"NERE CCI-BF" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Activez votre compte NERE CCI-BF',
    html
  });
};

// ── Email de réinitialisation de mot de passe ──
exports.envoyerEmailResetPassword = async (user, lien) => {
  const html = templateBase(`
    <p>Bonjour <strong>${user.prenom} ${user.nom}</strong>,</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
    <a href="${lien}" class="btn">Réinitialiser mon mot de passe</a>
    <p style="color:#888;font-size:12px;">Ce lien expire dans 1h. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
  `);

  await transporter.sendMail({
    from: `"NERE CCI-BF" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Réinitialisation de mot de passe — NERE CCI-BF',
    html
  });
};

// ── Email d'activation d'abonnement ──
exports.envoyerEmailActivationAbonnement = async (user, pack) => {
  const html = templateBase(`
    <p>Bonjour <strong>${user.prenom} ${user.nom}</strong>,</p>
    <p>Votre abonnement <strong style="color:#E8A020">Pack ${pack.nom.toUpperCase()}</strong> a été activé avec succès !</p>
    <p>Vous pouvez dès maintenant accéder à toutes les fonctionnalités de votre formule.</p>
    <a href="${process.env.CLIENT_URL}/recherche" class="btn">Commencer à rechercher</a>
  `);

  await transporter.sendMail({
    from: `"NERE CCI-BF" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Abonnement ${pack.nom.toUpperCase()} activé — NERE CCI-BF`,
    html
  });
};

// ── Email de rejet de reçu ──
exports.envoyerEmailRejetRecu = async (user, motif) => {
  const html = templateBase(`
    <p>Bonjour <strong>${user.prenom} ${user.nom}</strong>,</p>
    <p>Votre reçu de paiement n'a pas pu être validé.</p>
    <p><strong>Motif :</strong> ${motif}</p>
    <p>Veuillez soumettre un nouveau reçu ou contacter la CCI-BF.</p>
    <a href="${process.env.CLIENT_URL}/paiement" class="btn">Soumettre un nouveau reçu</a>
  `);

  await transporter.sendMail({
    from: `"NERE CCI-BF" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Reçu de paiement non validé — NERE CCI-BF',
    html
  });
};
