const sql = require('mssql');

const config = {
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  port: parseInt(process.env.SQL_PORT) || 1433,
  options: {
    encrypt: process.env.SQL_ENCRYPT === 'true',
    trustServerCertificate: true
  }
};

let pool;

const connecterSQLServer = async () => {
  try {
    pool = await sql.connect(config);
    console.log('✅ SQL Server NERE connecté (lecture seule)');
    return pool;
  } catch (err) {
    console.error('❌ Erreur connexion SQL Server :', err.message);
    throw err;
  }
};

const getPool = () => pool;

module.exports = { connecterSQLServer, getPool, sql };
