require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Binance = require('node-binance-api');

const app = express();
const PORT = 3000;
app.use(bodyParser.json());

// ✅ Clé secrète webhook
const SECRET_TOKEN = '#1960AlGeR@+=';

// ✅ Connexion Binance Testnet
const binance = new Binance().options({
  APIKEY: process.env.BINANCE_API_KEY,
  APISECRET: process.env.BINANCE_API_SECRET,
  test: true,
  urls: {
    base: 'https://testnet.binancefuture.com' // Bien testnet
  }
});

app.post('/webhook', async (req, res) => {
  const data = req.body;
  console.log('✅ Signal reçu :', data);

  const encodedToken = data.token || '';
  const decodedToken = Buffer.from(encodedToken, 'base64').toString('utf-8');
  console.log('🔍 Token décodé :', decodedToken);

  if (decodedToken !== SECRET_TOKEN) {
    console.log('❌ Token invalide');
    return res.status(403).json({ message: 'Token invalide' });
  }

  const {
    action = 'unknown',
    symbol = 'UNKNOWN',
    side = 'UNKNOWN',
    price = 0,
    contracts = 0,
    position_size = 0
  } = data;

  console.log(`📈 SYMBOLE : ${symbol}`);
  console.log(`🧾 SIDE : ${side}`);
  console.log(`💰 PRIX : ${price}`);
  console.log(`📦 QTE : ${contracts}`);

  // ✅ Envoyer ordre à Binance
  try {
    const response = await binance.futuresOrder({
      symbol: symbol,
      side: side.toUpperCase(),
      type: 'LIMIT',
      quantity: contracts,
      price: price,
      timeInForce: 'GTC'
    });

    console.log('✅ Ordre Binance envoyé :', response);
    return res.status(200).json({ message: 'Ordre envoyé à Binance' });

  } catch (err) {
    console.error('❌ Erreur envoi Binance :', err.body || err);
    return res.status(500).json({ message: 'Erreur Binance', details: err.body || err });
  }
});

app.listen(PORT, () => {
  console.log(`🟢 Serveur lancé sur le port ${PORT}`);
});
