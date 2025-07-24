require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
//const atob = require('atob');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const SECRET_TOKEN = '#1960AlGeR@+=';

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

  // Ne PAS vérifier l'action : ignorer "O #3", "entry", etc.
  // Utiliser uniquement `side`
  if (side.toLowerCase() === 'buy') {
    console.log(`✅ 📥 ACHAT ${symbol} à ${price}`);
  } else if (side.toLowerCase() === 'sell') {
    console.log(`✅ 📤 VENTE ${symbol} à ${price}`);
  } else {
    console.log(`❗ SIDE inconnu : ${side}`);
    return res.status(400).json({ error: 'SIDE non reconnu' });
  }

  return res.status(200).json({ message: 'Signal reçu et authentifié' });
});

app.listen(PORT, () => {
  console.log(`🟢 Serveur sécurisé lancé sur le port ${PORT}`);
});
