require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const atob = require('atob');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// 🔐 Token en base64 dans l'alerte TradingView
const SECRET_TOKEN = '#1960AlGeR@+='; // Ton vrai token ici

// 🔁 Route webhook sécurisée
app.post('/webhook', (req, res) => {
  const data = req.body;

  console.log('✅ Signal reçu :', data);

  const decodedToken = atob(data.token || '');

  console.log('🔍 Token décodé :', decodedToken);
  console.log('🔐 SECRET_TOKEN :', SECRET_TOKEN);

  if (decodedToken !== SECRET_TOKEN) {
    console.log('❌ Accès refusé : token invalide !');
    return res.status(403).json({ message: 'Token invalide' });
  }

  const {
    action = 'unknown',
    symbol = 'UNKNOWN',
    side = 'UNKNOWN',
    price = 0,
    contracts = 'N/A',
    position_size = 'N/A'
  } = data;

  console.log(`📥 ACTION : ${action}`);
  console.log(`📈 SYMBOLE : ${symbol}`);
  console.log(`🧾 SIDE : ${side}`);
  console.log(`💰 PRIX : ${price}`);
  console.log(`📦 CONTRACTS : ${contracts}`);
  console.log(`📊 POSITION : ${position_size}`);

  // 👉 Ici tu peux ajouter l’envoi vers Binance ou autre

  return res.status(200).json({ message: 'Signal reçu et authentifié' });
});

// 🟢 Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🟢 Serveur sécurisé lancé sur le port ${PORT}`);
});
