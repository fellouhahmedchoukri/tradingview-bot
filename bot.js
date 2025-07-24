require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Binance = require('node-binance-api');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

// Ton secret webhook
const SECRET_TOKEN = (process.env.SECRET_TOKEN || '').trim();

// Initialisation Binance Futures Testnet
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

  // Extraction
  const { symbol='', side='', price=null, contracts='0' } = data;
  console.log(`📈 ${symbol} – ${side} – QTY=${contracts} @ ${price||'MARKET'}`);

  try {
    let orderResponse;

    if (price) {
      // LIMIT order
      if (side.toLowerCase() === 'buy') {
        orderResponse = await binance.futuresBuy(symbol, contracts, price, { timeInForce: 'GTC' });
      } else {
        orderResponse = await binance.futuresSell(symbol, contracts, price, { timeInForce: 'GTC' });
      }
    } else {
      // MARKET order
      if (side.toLowerCase() === 'buy') {
        orderResponse = await binance.futuresMarketBuy(symbol, contracts);
      } else {
        orderResponse = await binance.futuresMarketSell(symbol, contracts);
      }
    }

    console.log('✅ Ordre Testnet créé :', orderResponse);
    return res.status(200).json({ message: 'Ordre envoyé', order: orderResponse });

  } catch (err) {
    console.error('❌ Erreur Binance :', err.body || err);
    return res.status(500).json({ error: 'Erreur Binance', details: err.body || err });
  }
});

app.listen(PORT, () => console.log(`🟢 Serveur lancé sur le port ${PORT}`));
