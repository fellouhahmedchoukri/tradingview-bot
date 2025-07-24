require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const atob = require('atob');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// 🔐 Token en clair à valider (doit correspondre au token décodé)
const SECRET_TOKEN = '#1960AlGeR@+=';

// 🔁 Route webhook
app.post('/webhook', (req, res) => {
  const data = req.body;

  console.log('✅ Signal reçu :', data);

  const decodedToken = atob(data.token || '');

  console.log('🔍 Token décodé :', decodedToken);
  console.log('🔐 SECRET_TOKEN :', SECRET_TOKEN);

  // 🔒 Vérification du token
  if (decodedToken !== SECRET_TOKEN) {
    console.log('❌ Accès refusé : token invalide !');
    return res.status(403).json({ message: 'Token invalide' });
  }

  // 🧩 Extraction des données (avec valeurs par défaut)
  const {
    action = 'unknown',
    symbol = 'UNKNOWN',
    side = 'UNKNOWN',
    price = 0,
    contracts = 'N/A',
    position_size = 'N/A'
  } = data;

  // 🧾 Affichage complet
  console.log(`📥 ACTION : ${action}`);
  console.log(`📈 SYMBOLE : ${symbol}`);
  console.log(`🧾 SIDE : ${side}`);
  console.log(`💰 PRIX : ${price}`);
  console.log(`📦 CONTRACTS : ${contracts}`);
  console.log(`📊 POSITION : ${position_size}`);

  // 🔁 Traitement basé sur le "side"
  if (side.toLowerCase() === 'buy') {
    console.log(`✅ 📥 ACHAT ${symbol} à ${price}`);
  } else if (side.toLowerCase() === 'sell') {
    console.log(`✅ 📤 VENTE ${symbol} à ${price}`);
  } else {
    console.log(`❗ Action inconnue : ${action} avec side=${side}`);
  }

  return res.status(200).json({ message: 'Signal reçu et authentifié' });
});

// 🟢 Lancement du serveur
app.listen(PORT, () => {
  console.log(`🟢 Serveur sécurisé lancé sur le port ${PORT}`);
});
