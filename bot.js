require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Binance = require('node-binance-api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Ton secret webhook (base64 décodé pour valider)
const SECRET_TOKEN = (process.env.SECRET_TOKEN || '').trim();

// Initialisation du client Binance Futures Testnet
const binance = new Binance().options({
  APIKEY: process.env.BINANCE_API_KEY,
  APISECRET: process.env.BINANCE_API_SECRET,
  test: true,
  urls: { base: 'https://testnet.binancefuture.com' }
});

app.post('/webhook', async (req, res) => {
  const data = req.body;
  console.log('✅ Signal reçu :', data);

  // Décodage et vérif du token
  const decodedToken = Buffer.from(data.token || '', 'base64').toString('utf-8').trim();
  if (decodedToken !== SECRET_TOKEN) {
    console.log('❌ Token invalide');
    return res.status(403).json({ error: 'Token invalide' });
  }

  // Extraction des paramètres
  const {
    action = 'unknown',
    symbol = '',
    side = '',
    price = null,
    contracts = '0'
  } = data;

  console.log(`📈 SYMBOLE=${symbol} SIDE=${side} QTE=${contracts} PRIX=${price || 'market'}`);

  try {
    let order;
    if (price) {
      // LIMIT order
      order = await binance.futuresOrder({
        symbol: symbol,
        side: side.toUpperCase(),     // BUY ou SELL
        type: 'LIMIT',
        quantity: contracts,
        price: price,
        timeInForce: 'GTC'
      });
    } else {
      // MARKET order
      order = await binance.futuresOrder({
        symbol: symbol,
        side: side.toUpperCase(),
        type: 'MARKET',
        quantity: contracts
      });
    }

    console.log('✅ Ordre Testnet créé :', order);
    return res.status(200).json({ message: 'Ordre envoyé', order });
  } catch (err) {
    console.error('❌ Erreur Binance :', err.body || err);
    return res.status(500).json({ error: 'Erreur Binance', details: err.body || err });
  }
});

app.listen(PORT, () => {
  console.log(`🟢 Serveur lancé sur le port ${PORT}`);
});
