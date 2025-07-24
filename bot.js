require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Binance = require('node-binance-api');
const app = express();
const PORT = process.env.PORT || 3000;

// Initialise Binance API
const binance = new Binance().options({
  APIKEY: process.env.APIKEY,
  APISECRET: process.env.APISECRET,
  useServerTime: true,
  test: false,
  urls: {
    base: 'https://testnet.binancefuture.com' // Testnet Futures
  }
});

app.use(bodyParser.json());

const VALID_TOKEN = "IzE5NjBBbEdlUkArPQ==";

// 🔧 Fonction d’arrondi selon la précision du symbole
function roundQuantity(symbol, quantity) {
  const precisionMap = {
    BTCUSDT: 3,
    ETHUSDT: 3,
    BNBUSDT: 1,
    SOLUSDT: 2,
    XRPUSDT: 1,
    // Ajoute d'autres si nécessaire
  };
  const decimals = precisionMap[symbol.toUpperCase()] || 3;
  return parseFloat(quantity).toFixed(decimals);
}

app.post('/webhook', async (req, res) => {
  const signal = req.body;

  console.log("✅ Signal reçu :", signal);

  if (!signal.token || signal.token !== VALID_TOKEN) {
    console.log("❌ Token invalide");
    return res.status(403).json({ error: "Token invalide" });
  }

  if (!signal.symbol || !signal.side) {
    return res.status(400).json({ error: "Paramètres manquants" });
  }

  const symbol = signal.symbol.toUpperCase();
  const side = signal.side.toLowerCase();
  const action = signal.action || "market-test";
  const qty = roundQuantity(symbol, signal.contracts || 0.001);

  console.log(`📈 ${symbol} – ${side} – QTY=${qty} @ ${signal.price || "MARKET"}`);

  try {
    let order;
    if (side === 'buy') {
      order = await binance.futuresMarketBuy(symbol, qty);
    } else if (side === 'sell') {
      order = await binance.futuresMarketSell(symbol, qty);
    } else {
      return res.status(400).json({ error: "Côté de l'ordre non reconnu" });
    }

    console.log("✅ Ordre Testnet créé :", order);
    res.json({ message: "Ordre exécuté", order });
  } catch (err) {
    console.error("❌ Erreur Binance :", err);
    res.status(500).json({ error: "Erreur Binance", details: err.body || err });
  }
});

app.listen(PORT, () => {
  console.log(`🟢 Serveur lancé sur le port ${PORT}`);
});
