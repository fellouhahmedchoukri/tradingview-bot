const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Token secret dans .env ou Railway Variables
const SECRET_TOKEN = (process.env.SECRET_TOKEN || "").trim();

app.use(bodyParser.json());

app.post("/webhook", (req, res) => {
  const { action, symbol, side, price, token } = req.body;

  console.log("✅ Signal reçu :", req.body);

  // Décodage base64 du token
  let decodedToken = "";
  try {
    decodedToken = Buffer.from(token || "", "base64").toString("utf-8").trim();
  } catch (err) {
    console.log("❌ Token illisible (non base64)");
    return res.status(400).json({ error: "Token illisible" });
  }

  console.log("🔍 Token décodé :", JSON.stringify(decodedToken));
  console.log("🔐 SECRET_TOKEN :", JSON.stringify(SECRET_TOKEN));

  // Vérification du token
  if (!SECRET_TOKEN || decodedToken !== SECRET_TOKEN) {
    console.log("❌ Accès refusé : token invalide !");
    return res.status(403).json({ error: "Token invalide" });
  }

  if (!action || !symbol) {
    return res.status(400).json({ error: "action et symbol sont requis." });
  }

  if (action === "entry" && side === "buy") {
    console.log(`📥 ACHAT ${symbol} à ${price}`);
  } else if (action === "exit") {
    console.log(`📤 VENTE ${symbol} à ${price}`);
  } else if (action === "grid_destroyed") {
    console.log(`💥 Grid détruit pour ${symbol}`);
  } else {
    console.log("❗ Action inconnue :", action);
    return res.status(400).json({ error: "Action non reconnue" });
  }

  return res.status(200).json({ message: "Signal reçu et authentifié" });
});

app.get("/", (_req, res) => {
  res.send("🔐 Webhook sécurisé actif !");
});

app.listen(port, () => {
  console.log(`🟢 Serveur sécurisé lancé sur le port ${port}`);
});
