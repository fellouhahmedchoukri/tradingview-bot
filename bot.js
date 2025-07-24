const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

// Permet de lire les JSON envoyés par TradingView
app.use(bodyParser.json());

// ✅ Webhook principal
app.post("/webhook", (req, res) => {
  const data = req.body;

  console.log("✅ Signal reçu :", data);

  const action = data.action;
  const symbol = data.symbol;
  const side = data.side;
  const price = data.price;

  if (!action || !symbol) {
    console.log("❌ Champs requis manquants !");
    return res.status(400).json({ error: "action et symbol sont requis." });
  }

  // Logique selon le signal
  if (action === "entry" && side === "buy") {
    console.log(`📥 Signal D'ACHAT reçu pour ${symbol} à ${price}`);
    // 👉 Ajoute ici ton appel à Binance ou ta logique d’exécution
  } else if (action === "exit") {
    console.log(`📤 Signal de VENTE reçu pour ${symbol}`);
  } else if (action === "grid_destroyed") {
    console.log(`💥 Grid détruit pour ${symbol}`);
  } else {
    console.log("❓ Action inconnue :", action);
  }

  res.json({ message: "✅ Signal traité avec succès." });
});

// Test GET
app.get("/", (req, res) => {
  res.send("🚀 Webhook TradingView est actif !");
});

app.listen(port, () => {
  console.log(`🟢 Serveur lancé sur le port ${port}`);
});
