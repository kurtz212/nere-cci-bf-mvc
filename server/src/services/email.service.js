const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Fonction générique ──
exports.envoyerEmail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP non configuré — email non envoyé');
    return;
  }
  await transporter.sendMail({
    from:    `"NERE CCI-BF" <${process.env.SMTP_USER}>`,
    to, subject, html, text,
  });
  console.log(`📧 Email envoyé à: ${to}`);
};

// ── Email vérification compte ──
exports.envoyerEmailVerification = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await exports.envoyerEmail({
    to:      user.email,
    subject: '✅ Vérifiez votre adresse email — NERE CCI-BF',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2>Bonjour ${user.prenom},</h2>
        <p>Cliquez sur le lien ci-dessous pour activer votre compte :</p>
        <a href="${url}" style="background:#4DC97A;color:#0A3D1F;padding:12px 24px;
          border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">
          Activer mon compte
        </a>
        <p style="color:#888;font-size:12px;margin-top:20px;">
          Ce lien expire dans 24h.
        </p>
      </div>
    `,
  });
};

// ── Notification admin nouvelle demande ──
exports.notifierNouvelleDemandeAdmin = async (demande) => {
  if (!process.env.SMTP_USER) return;
  await exports.envoyerEmail({
    to:      process.env.SMTP_USER,
    subject: '📋 Nouvelle demande de document — NERE CCI-BF',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2>Nouvelle demande reçue</h2>
        <p><strong>Type :</strong> ${demande.typeRequete}</p>
        <p><strong>Contact :</strong> ${demande.contact}</p>
        <p><strong>Description :</strong> ${demande.description}</p>
      </div>
    `,
  });
};

// ── Confirmation demande utilisateur ──
exports.confirmerDemandeUtilisateur = async (user, demande) => {
  if (!user?.email) return;
  await exports.envoyerEmail({
    to:      user.email,
    subject: '✅ Votre demande a été reçue — NERE CCI-BF',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2>Bonjour ${user.prenom},</h2>
        <p>Votre demande de document a bien été reçue et sera traitée dans les meilleurs délais.</p>
        <p><strong>Type :</strong> ${demande.typeRequete}</p>
      </div>
    `,
  });
};