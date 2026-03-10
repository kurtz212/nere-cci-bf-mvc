const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const dotenv     = require('dotenv');
dotenv.config();

const app = express();

// ── Middlewares globaux ──
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// ── Routes ──
app.use('/api/auth',          require('./src/routes/auth.routes'));
app.use('/api/users',         require('./src/routes/user.routes'));
app.use('/api/packs',         require('./src/routes/pack.routes'));
app.use('/api/abonnements',   require('./src/routes/subscription.routes'));
app.use('/api/paiements',     require('./src/routes/payment.routes'));
app.use('/api/publications',  require('./src/routes/publication.routes'));
app.use('/api/recherche',     require('./src/routes/recherche.routes'));
app.use('/api/admin',         require('./src/routes/admin.routes'));

// ── Gestion erreurs globale ──
app.use(require('./src/middlewares/error.middleware'));

// ── Connexion MongoDB ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connecté');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Serveur sur http://localhost:${process.env.PORT || 5000}`)
    );
  })
  .catch(err => { console.error('❌ MongoDB:', err); process.exit(1); });
