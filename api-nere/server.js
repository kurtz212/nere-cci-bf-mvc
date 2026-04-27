// api-nere/server.js
const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
dotenv.config();

const { connecterSQLServer } = require('./src/config/sqlserver');

const app  = express();
const PORT = process.env.NERE_PORT || 5001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/entreprises', require('./src/routes/entreprises.routes'));

// Health check
app.get('/health', (req, res) => res.json({
  status: 'ok', service: 'api-nere', port: PORT
}));

// Gestion erreur port occupé
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`✅ API NERE démarrée sur http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${port} occupé, essai sur ${port + 1}...`);
      startServer(port + 1);
    } else {
      throw err;
    }
  });
};

// Démarrage — connexion SQL Server puis lancement serveur
connecterSQLServer()
  .then(() => startServer(PORT))
  .catch(err => {
    console.error('❌ SQL Server échoué :', err.message);
    console.log('⚠️  Démarrage sans SQL Server...');
    startServer(PORT);
  });