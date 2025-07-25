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
  test: true, // ⚠️ Mode testnet (ne passe pas d'ordre réel)
  verbose: true,
  urls: {
    base: "https://testnet.binancefuture.com",
  },
});

app.use(bodyParser.json());

const TOKEN = process.env.WEBHOOK_TOKEN;

// Précision décimale par symbole
const PRECISIONS = {
  BTCUSDT: 3,
  ETHUSDT: 3,
  BNBUSDT: 2,
  SOLUSDT: 2,
  XRPUSDT: 1,
};

// Ajuste la quantité en fonction du symbole
function adjustQuantity(symbol, qty) {
  const precision = PRECISIONS[symbol] || 3;
  return Number(parseFloat(qty).toFixed(precision));
}

app.post("/webhook", async (req, res) => {
  const signal = req.body;
  console.log("✅ Signal reçu :", signal);

  // Vérifications minimales
  if (
    !signal ||
    !signal.token ||
    signal.token !== TOKEN ||
    !signal.symbol ||
    !signal.side ||
    !signal.contracts
  ) {
    console.log("❌ Rejeté – signal incomplet ou token invalide :", signal);
    return res.status(400).json({ error: "Signal invalide ou token incorrect" });
  }

  const symbol = signal.symbol.toUpperCase();
  const side = signal.side.toUpperCase();
  const price = signal.price;
  const contracts = parseFloat(signal.contracts);

  // Vérifie la quantité
  if (!contracts || contracts <= 0) {
    console.log("⚠️ Quantité nulle ou invalide, ordre ignoré.");
    return res.status(200).json({ message: "Ordre ignoré (contracts <= 0)" });
  }

  const quantity = adjustQuantity(symbol, contracts);
  console.log(`📈 ${symbol} – ${side} – QTY=${quantity} @ ${price || "MARKET"}`);

  try {
    const order = await binance.futuresOrder({
      symbol,
      side,
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
    console.error("❌ Erreur Binance :", err.body || err.message);
    res.status(500).json({ error: "Erreur Binance", details: err.body || err.message });
  }
});

app.listen(port, () => {
  console.log(`\n🟢 Serveur lancé sur le port ${port}\n`);
});
