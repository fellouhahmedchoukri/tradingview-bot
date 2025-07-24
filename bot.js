import express from 'express';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import config from './config.js';

const app = express();
app.use(express.json());

// Middleware de sécurité
app.use((req, res, next) => {
  if (req.headers['x-api-key'] !== config.SIGNING_KEY) {
    console.warn('⚠️ Accès refusé : Clé API invalide');
    return res.status(401).json({ error: 'Clé API invalide' });
  }
  next();
});

// Endpoint principal
app.post('/webhook', async (req, res) => {
  try {
    console.log('\n📡 Requête reçue:', req.body);

    if (!req.body.symbol || !req.body.side) {
      throw new Error('Symbol et side requis');
    }

    const orderParams = {
      symbol: req.body.symbol.replace('PERP', '').toUpperCase(),
      side: req.body.side.toUpperCase(),
      type: req.body.type || 'MARKET',
      quantity: req.body.quantity || 0.001, // Valeur par défaut
      timestamp: Date.now(),
      recvWindow: 5000
    };

    // Signature corrigée
    const queryString = Object.keys(orderParams)
      .sort()
      .map(key => `${key}=${encodeURIComponent(orderParams[key])}`)
      .join('&');
    orderParams.signature = CryptoJS.HmacSHA256(queryString, config.BINANCE_API_SECRET).toString();

    // URL CORRIGÉE POUR FUTURES TESTNET
    const response = await axios.post(
      'https://testnet.binancefuture.com/fapi/v1/order',
      null,
      {
        params: orderParams,
        headers: { 'X-MBX-APIKEY': config.BINANCE_API_KEY }
      }
    );

    console.log('✅ Ordre exécuté:', response.data);
    res.json({ status: 'success', data: response.data });

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Échec de l\'ordre',
      details: error.response?.data || error.message
    });
  }
});

// Démarrer le serveur
app.listen(config.WEBHOOK_PORT, () => {
  console.log(`\n🚀 Bot Futures Testnet actif sur le port ${config.WEBHOOK_PORT}`);
  console.log(`🔗 Endpoint: /webhook`);
  console.log(`🔑 Clé API: ${config.BINANCE_API_KEY}\n`);
});
