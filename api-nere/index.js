const express = require('express');
const dotenv  = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use(require('./src/middlewares/apiKey.middleware'));

app.use('/api/entreprises', require('./src/routes/entreprises.routes'));

app.listen(process.env.NERE_PORT || 5001, () =>
  console.log(`🗄️  API-NERE sur http://localhost:${process.env.NERE_PORT || 5001}`)
);
