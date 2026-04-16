const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const User   = require('../models/User.model');

const genererToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const envoyerEmail = async ({ to, subject, html }) => {
  try {
    const nodemailer  = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: `"NERE CCI-BF" <${process.env.SMTP_USER}>`,
      to, subject, html,
    });
    console.log('📧 Email envoyé à:', to);
  } catch(e) {
    console.warn('⚠️  Email non envoyé (SMTP non configuré):', e.message);
    // Ne pas bloquer l'inscription si email échoue
  }
};

// ══════════════════════════════════════
// INSCRIPTION
// POST /api/auth/inscription
// ══════════════════════════════════════
exports.inscription = async (req, res, next) => {
  try {
    const { typeCompte, nom, prenom, fonction, telephone, email, siteWeb, password } = req.body;

    const sansEmail = !email || email.trim() === '';

    // Vérifier unicité email seulement si fourni
    if (!sansEmail) {
      const existant = await User.findOne({ email });
      if (existant)
        return res.status(400).json({ success:false, message:'Cet email est déjà utilisé.' });
    }

    const verifyToken     = crypto.randomBytes(32).toString('hex');
    const verifyTokenHash = crypto.createHash('sha256').update(verifyToken).digest('hex');

    // MODE TEST : emailVerified = true pour tous les comptes
    const modeTest = true; // Mettre false en production

    const user = await User.create({
      typeCompte, nom, prenom, fonction, telephone, siteWeb, password,
      email:             sansEmail ? undefined : email,
      emailVerified:     modeTest ? true : sansEmail,
      role:              'subscriber',
      emailVerifyToken:  (modeTest || sansEmail) ? undefined : verifyTokenHash,
      emailVerifyExpire: (modeTest || sansEmail) ? undefined : Date.now() + 24 * 60 * 60 * 1000,
    });

    if (!sansEmail) {
      const lien = `${process.env.CLIENT_URL}/verifier-email/${verifyToken}`;
      await envoyerEmail({
        to: email,
        subject: '✅ Activez votre compte NERE CCI-BF',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
            <div style="background:#0A3D1F;padding:28px;text-align:center;border-radius:12px 12px 0 0;">
              <h1 style="color:#4DC97A;margin:0;font-size:22px;">NERE CCI-BF</h1>
            </div>
            <div style="background:#fff;padding:36px;border:1px solid #e8f0eb;border-radius:0 0 12px 12px;">
              <h2 style="color:#0A2410;font-size:20px;margin-bottom:12px;">Bonjour ${prenom} ${nom},</h2>
              <p style="color:#2D5A3A;line-height:1.7;margin-bottom:24px;">
                Votre compte a été créé. Cliquez ci-dessous pour l'activer.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${lien}" style="background:#4DC97A;color:#0A3D1F;padding:14px 32px;
                  border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
                  ✅ Activer mon compte
                </a>
              </div>
              <p style="color:#6B9A7A;font-size:12px;text-align:center;">Ce lien expire dans <strong>24h</strong>.</p>
            </div>
          </div>
        `,
      });
    }

    res.status(201).json({
      success:   true,
      sansEmail,
      message:   sansEmail
        ? 'Compte créé et activé. Vous pouvez vous connecter.'
        : 'Compte créé. Vérifiez votre email pour activer votre compte.',
      userId:    user._id,
    });

  } catch (err) { next(err); }
};

// ══════════════════════════════════════
// VÉRIFICATION EMAIL
// GET /api/auth/verifier-email/:token
// ══════════════════════════════════════
exports.verifierEmail = async (req, res, next) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      emailVerifyToken:  tokenHash,
      emailVerifyExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success:false, message:'Lien invalide ou expiré.' });

    user.emailVerified     = true;
    user.role              = 'subscriber';
    user.emailVerifyToken  = undefined;
    user.emailVerifyExpire = undefined;
    await user.save();

    const token = genererToken(user._id);
    res.redirect(`${process.env.CLIENT_URL}/connexion?verified=1&token=${token}`);

  } catch (err) { next(err); }
};

// ══════════════════════════════════════
// CONNEXION
// POST /api/auth/connexion
// ══════════════════════════════════════
exports.connexion = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success:false, message:'Email et mot de passe requis.' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.verifierMotDePasse(password)))
      return res.status(401).json({ success:false, message:'Email ou mot de passe incorrect.' });

    if (!user.emailVerified)
      return res.status(401).json({ success:false, message:'Veuillez vérifier votre email avant de vous connecter.' });

    // Vérifier si la suspension temporaire est expirée → réactiver automatiquement
    if (!user.isActive && user.suspendJusquau && new Date() > new Date(user.suspendJusquau)) {
      user.isActive         = true;
      user.suspendJusquau   = null;
      user.raisonSuspension = '';
      await user.save();
    }

    if (!user.isActive) {
      const msg = user.suspendJusquau
        ? `Compte suspendu jusqu'au ${new Date(user.suspendJusquau).toLocaleDateString('fr-FR')}. Motif : ${user.raisonSuspension||'Non précisé'}`
        : 'Compte suspendu. Contactez la CCI-BF.';
      return res.status(401).json({ success:false, message: msg });
    }

    user.derniereConnexion = new Date();
    await user.save();

    const token = genererToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id:         user._id,
        nom:        user.nom,
        prenom:     user.prenom,
        email:      user.email,
        typeCompte: user.typeCompte,
        fonction:   user.fonction,
        role:       user.role,
      },
    });

  } catch (err) { next(err); }
};

// ══════════════════════════════════════
// MOT DE PASSE OUBLIÉ
// POST /api/auth/mot-de-passe-oublie
// ══════════════════════════════════════
exports.motDePasseOublie = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(404).json({ success:false, message:'Aucun compte avec cet email.' });

    const resetToken         = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken  = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    await user.save();

    const lien = `${process.env.CLIENT_URL}/reinitialiser-mdp/${resetToken}`;
    await envoyerEmail({
      to: user.email,
      subject: '🔑 Réinitialisation mot de passe NERE CCI-BF',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
          <div style="background:#0A3D1F;padding:28px;text-align:center;border-radius:12px 12px 0 0;">
            <h1 style="color:#4DC97A;margin:0;font-size:22px;">NERE CCI-BF</h1>
          </div>
          <div style="background:#fff;padding:36px;border:1px solid #e8f0eb;border-radius:0 0 12px 12px;">
            <h2 style="color:#0A2410;font-size:20px;margin-bottom:12px;">Bonjour ${user.prenom},</h2>
            <p style="color:#2D5A3A;line-height:1.7;margin-bottom:24px;">
              Vous avez demandé à réinitialiser votre mot de passe.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${lien}" style="background:#4DC97A;color:#0A3D1F;padding:14px 32px;
                border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
                🔑 Réinitialiser mon mot de passe
              </a>
            </div>
            <p style="color:#6B9A7A;font-size:12px;text-align:center;">
              Ce lien expire dans <strong>1 heure</strong>.
            </p>
          </div>
        </div>
      `,
    });

    res.json({ success:true, message:'Email de réinitialisation envoyé.' });

  } catch (err) { next(err); }
};

// ══════════════════════════════════════
// RÉINITIALISER MOT DE PASSE
// PUT /api/auth/reinitialiser-mdp/:token
// ══════════════════════════════════════
exports.reinitialiserMotDePasse = async (req, res, next) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken:  tokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success:false, message:'Lien invalide ou expiré.' });

    user.password            = req.body.password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success:true, message:'Mot de passe réinitialisé avec succès.' });

  } catch (err) { next(err); }
};