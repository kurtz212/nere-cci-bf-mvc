const express    = require('express');
const http       = require('http');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const dotenv     = require('dotenv');
dotenv.config();

const app    = express();
const server = http.createServer(app);

// ── Socket.io (optionnel) ──
let io = null;
try {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials:true }
  });
  app.set('io', io);
  try {
    require('./src/socket')(io);
    console.log('✅ Socket.io initialisé');
  } catch(e) {
    console.warn('⚠️  src/socket.js manquant:', e.message);
  }
} catch(e) {
  console.warn('⚠️  socket.io non installé:', e.message);
}

// ── Middlewares ──
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// ── Route de test ──
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '✅ Serveur NERE CCI-BF opérationnel',
    date: new Date()
  });
});

// ── Routes — chargement sécurisé ──
const ROUTES = [
  { path:'/api/auth',         file:'./src/routes/auth.routes'        },
  { path:'/api/users',        file:'./src/routes/user.routes'        },
  { path:'/api/publications', file:'./src/routes/publication.routes' },
  { path:'/api/demandes',     file:'./src/routes/demande.routes'     },
  { path:'/api/chat',         file:'./src/routes/chat.routes'        },
  { path:'/api/reclamations', file:'./src/routes/reclamation.routes' },
];

ROUTES.forEach(({ path, file }) => {
  try {
    app.use(path, require(file));
    console.log('✅ Route : ' + path);
  } catch(e) {
    console.warn('⚠️  Route ignorée [' + path + '] : ' + e.message);
  }
});

// ── Middleware erreurs ──
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Erreur serveur',
  });
});

// ── MongoDB + Démarrage ──
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nere-cci-bf';
const PORT      = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connecté');
    server.listen(PORT, () =>
      console.log('🚀 Serveur sur http://localhost:' + PORT)
    );
  })
  .catch(err => {
    console.error('❌ MongoDB:', err.message);
    server.listen(PORT, () =>
      console.log('🚀 Serveur sur http://localhost:' + PORT + ' (sans MongoDB)')
    );
  });