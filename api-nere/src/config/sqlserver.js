// api-nere/src/config/sqlserver.js
const sql = require('mssql');

const config = {
  server:   process.env.SQL_SERVER   || 'DESKTOP-7AKCQQD',
  database: process.env.SQL_DATABASE || 'dbNERE',
  user:     process.env.SQL_USER     || 'sa',
  password: process.env.SQL_PASSWORD || 'Nere2024!',
  port:     parseInt(process.env.SQL_PORT) || 1433,
  options: {
    trustServerCertificate: true,
    enableArithAbort:       true,
    encrypt:                false,
  },
  pool: { max:10, min:0, idleTimeoutMillis:30000 },
};

// Pool global — créé une seule fois
let pool = null;

const connecterSQLServer = async () => {
  if (pool) return pool; // déjà connecté
  try {
    console.log(`🔌 Connexion : ${config.server}:${config.port}/${config.database} (user: ${config.user})`);
    pool = await new sql.ConnectionPool(config).connect();
    pool.on('error', err => {
      console.error('❌ Pool SQL Server erreur :', err.message);
      pool = null; // réinitialiser pour reconnecter
    });
    console.log('✅ SQL Server dbNERE connecté');
    return pool;
  } catch (err) {
    console.error('❌ Erreur connexion SQL Server :', err.message);
    throw err;
  }
};

const getPool = () => {
  if (!pool) throw new Error('SQL Server non connecté.');
  return pool;
};

module.exports = { connecterSQLServer, getPool, sql };