import express from 'express';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import config from './config.js';

const app = express();
app.use(express.json());

// ====================
// MIDDLEWARE DE SECURITE
// ====================
app.use((req, res, next) => {
  // 1. Authentification par clé
  if (req.headers['x-api-key'] !== config.SIGNING_KEY) {
    console.warn('Accès non autorisé depuis IP:', req.ip);
    return res.status(401).json({ error: 'Clé API invalide' });
  }
  next();
});

// ====================
// ENDPOINT PRINCIPAL
// ====================
app.post('/webhook', async (req, res) => {
  try {
    console.log('📡 Requête reçue:', req.body);

    // Validation minimale
    if (!req.body.symbol || !req.body.side) {
      throw new Error('Paramètres manquants');
    }

    // Formatage des paramètres (100% piloté par TradingView)
    const orderParams = {
      symbol: req.body.symbol.replace('PERP', '').toUpperCase(),
      side: req.body.side.toUpperCase(),
      type: req.body.type || 'MARKET',      // 'LIMIT' si fourni
      quantity: req.body.quantity,          // Doit être envoyé
      timestamp: Date.now(),
      recvWindow: 60000                     // Large fenêtre pour éviter les erreurs
    };

    // Gestion des stops (optionnel)
    if (req.body.stopPrice) {
      orderParams.stopPrice = req.body.stopPrice;
      orderParams.workingType = 'MARK_PRICE';
    }

    // Signature Binance
    const queryString = Object.keys(orderParams)
      .map(key => `${key}=${orderParams[key]}`)
      .join('&');
    orderParams.signature = CryptoJS.HmacSHA256(queryString, config.BINANCE_API_SECRET).toString();

    // Exécution sur TESTNET
    const response = await axios.post(
      'https://testnet.binancefuture.com/fapi/v1/order',  // URL Testnet
      null,
      {
        params: orderParams,
        headers: { 
          'X-MBX-APIKEY': config.BINANCE_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Ordre exécuté sur Testnet:', response.data);
    res.json({ status: 'success', data: response.data });

  } catch (error) {
    const errData = error.response?.data || error.message;
    console.error('❌ Erreur Testnet:', errData);
    res.status(500).json({ 
      error: 'Échec de l\'ordre',
      details: errData 
    });
  }
});

// ====================
// LANCEMENT
// ====================
app.listen(config.WEBHOOK_PORT, () => {
  console.log(`🚀 Webhook Testnet actif sur http://localhost:${config.WEBHOOK_PORT}`);
  console.log(`🔑 Clé API Testnet: ${config.BINANCE_API_KEY}`);
});
