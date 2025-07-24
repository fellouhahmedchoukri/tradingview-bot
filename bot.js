const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// 👇 Permet de lire les JSON envoyés par TradingView
app.use(bodyParser.json());

// ✅ Route principale Webhook
app.post("/webhook", (req, res) => {
  const data = req.body;

  console.log("✅ Signal reçu :", data);

  const action = data.action;
  const symbol = data.symbol;
  const side = data.side;
  const price = data.price;

  // Vérification simple
  if (!action || !symbol) {
    console.log("❌ Champs manquants !");
    return res.status(400).json({ error: "action et symbol sont requis." });
  }

  // Traitement des actions
  if (action === "entry" && side === "buy") {
    console.log(`📥 Signal D'ACHAT reçu pour ${symbol} à ${price}`);
    // 👉 Ici : logique d'achat
  } else if (action === "exit") {
    console.log(`📤 Signal de VENTE reçu pour ${symbol}`);
    // 👉 Ici : logique de vente
  } else if (action === "grid_destroyed") {
    console.log(`💥 Grid détruit pour ${symbol}`);
    // 👉 Ici : tout fermer
  } else {
    console.log("❓ Action inconnue :", action);
  }

  res.json({ message: "✅ Signal traité avec succès." });
});

// 🔁 Test simple sur page d'accueil
app.get("/", (req, res) => {
  res.send("🚀 Webhook TradingView opérationnel !");
});

// ▶️ Lancement serveur
app.listen(port, () => {
  console.log(`🟢 Serveur lancé sur le port ${port}`);
});
