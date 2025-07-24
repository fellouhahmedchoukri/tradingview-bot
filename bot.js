require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Binance = require('node-binance-api');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

const SECRET_TOKEN = (process.env.SECRET_TOKEN || '').trim();
const binance = new Binance().options({
  APIKEY:    process.env.BINANCE_API_KEY,
  APISECRET: process.env.BINANCE_API_SECRET,
  test:      true,
  urls:      { base: 'https://testnet.binancefuture.com' }
});

app.post('/webhook', async (req, res) => {
  const data = req.body;
  console.log('✅ Signal reçu :', data);

  // Vérification du token
  const decoded = Buffer.from(data.token||'', 'base64').toString('utf-8').trim();
  if (decoded !== SECRET_TOKEN) {
    console.log('❌ Token invalide');
    return res.status(403).json({ error: 'Token invalide' });
  }

  const { symbol='', side='', price=null, contracts='0' } = data;
  console.log(`📈 ${symbol} – ${side} – ${contracts} @ ${price||'MARKET'}`);

  try {
    let order;
    if (price) {
      order = await binance.futuresOrder({
        symbol, side: side.toUpperCase(), type: 'LIMIT',
        quantity: contracts, price, timeInForce: 'GTC'
      });
    } else {
      order = await binance.futuresOrder({
        symbol, side: side.toUpperCase(), type: 'MARKET',
        quantity: contracts
      });
    }
    console.log('✅ Ordre Testnet créé :', order);
    return res.status(200).json({ message: 'Ordre envoyé', order });
  } catch (e) {
    console.error('❌ Erreur Binance :', e.body||e);
    return res.status(500).json({ error: 'Erreur Binance', details: e.body||e });
  }
});

app.listen(PORT, () => console.log(`🟢 Serveur lancé sur le port ${PORT}`));
