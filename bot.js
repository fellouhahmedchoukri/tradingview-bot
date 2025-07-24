const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

// 🔐 Ton token secret ici (à garder confidentiel)
const SECRET_TOKEN = process.env.SECRET_TOKEN || "MON_TOKEN_SECRET_123";

app.use(bodyParser.json());

app.post("/webhook", (req, res) => {
  const data = req.body;

  console.log("✅ Signal reçu :", data);

  const { action, symbol, side, price, token } = data;

  // 🔐 Vérification du token
  if (token !== SECRET_TOKEN) {
    console.log("❌ Accès refusé : token invalide !");
    return res.status(403).json({ error: "Token invalide" });
  }

  if (!action || !symbol) {
    console.log("❌ Champs requis manquants !");
    return res.status(400).json({ error: "action et symbol sont requis." });
  }

  if (action === "entry" && side === "buy") {
    console.log(`📥 Signal D'ACHAT reçu pour ${symbol} à ${price}`);
  } else if (action === "exit") {
    console.log(`📤 Signal de VENTE reçu pour ${symbol}`);
  } else if (action === "grid_destroyed") {
    console.log(`💥 Grid détruit pour ${symbol}`);
  } else {
    console.log("❓ Action inconnue :", action);
  }

  res.json({ message: "✅ Signal sécurisé traité avec succès." });
});

app.get("/", (req, res) => {
  res.send("🔐 Webhook sécurisé actif !");
});

app.listen(port, () => {
  console.log(`🟢 Serveur sécurisé lancé sur le port ${port}`);
});
