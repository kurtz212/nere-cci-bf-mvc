// Placez ce fichier dans le dossier client/ et exécutez : node ajouter-proxy.js
// Il ajoute automatiquement "proxy" dans votre package.json client

const fs   = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, 'package.json');
const pkg     = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

if (pkg.proxy) {
  console.log(`  Proxy déjà configuré : ${pkg.proxy}`);
} else {
  pkg.proxy = 'http://localhost:5000';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log('✅ Proxy ajouté : http://localhost:5000');
  console.log('   Redémarrez React (Ctrl+C puis npm start)');
}