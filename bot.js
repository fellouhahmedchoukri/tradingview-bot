// bot.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const Binance = require("node-binance-api");

const app = express();
const port = process.env.PORT || 3000;

const binance = new Binance().options({
  APIKEY: process.env.BINANCE_API_KEY,
  APISECRET: process.env.BINANCE_API_SECRET,
  useServerTime: true,
  test: true, // Testnet Binance
  verbose: true,
  urls: {
    base: "https://testnet.binancefuture.com",
  },
});

app.use(bodyParser.json());

const TOKEN = process.env.WEBHOOK_TOKEN;

// Précisions par défaut pour certaines paires (sinon 3 décimales par défaut)
const PRECISIONS = {
  BTCUSDT: 3,
  ETHUSDT: 3,
  BNBUSDT: 2,
};

function adjustQuantity(symbol, qty) {
  const precision = PRECISIONS[symbol] || 3;
  return Number(parseFloat(qty).toFixed(precision));
}

app.post("/webhook", async (req, res) => {
  const data = req.body;
  console.log("✅ Signal reçu :", data);

  if (!data.token || data.token !== TOKEN) {
    console.log("❌ Token invalide");
    return res.status(403).json({ error: "Token invalide" });
  }

  const { symbol, side, price, contracts, action } = data;

  if (!symbol || !side || !contracts) {
    return res.status(400).json({ error: "Paramètres manquants" });
  }

  const quantity = adjustQuantity(symbol, contracts);

  try {
    console.log(`📈 ${symbol} – ${side} – QTY=${quantity} @ ${price || 'MARKET'}`);

    const order = await binance.futuresOrder({
      symbol,
      side: side.toUpperCase(),
      type: price ? "LIMIT" : "MARKET",
      quantity,
      ...(price && {
        price,
        timeInForce: "GTC",
      }),
    });

    console.log("✅ Ordre Testnet créé :", order);
    res.json({ message: "Ordre envoyé à Binance Testnet", order });
  } catch (err) {
    console.error("❌ Erreur Binance :", err);
    res.status(500).json({ error: "Erreur Binance", details: err.body || err.message });
  }
});

app.listen(port, () => {
  console.log(`\n🟢 Serveur lancé sur le port ${port}\n`);
});
