const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

// Chargement des variables d'environnement
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const SECRET_TOKEN = process.env.SECRET_TOKEN;

app.use(bodyParser.json());

app.post("/webhook", (req, res) => {
  const { action, symbol, side, price, token } = req.body;

  console.log("✅ Signal reçu :", req.body);

  // 🔐 Vérification du token encodé en base64
  const decodedToken = Buffer.from(token, "base64").toString("utf-8").trim();
  const expectedToken = SECRET_TOKEN.trim();

  // 🔍 Affichage debug pour comparaison
  console.log("🔍 Token décodé :", decodedToken);
  console.log("🔐 SECRET_TOKEN :", expectedToken);

  if (decodedToken !== expectedToken) {
    console.log("❌ Accès refusé : token invalide !");
    return res.status(403).json({ error: "Token invalide" });
  }

  // ✅ Token valide, exécution de l'action
  if (action === "entry") {
    console.log(`📥 ACHAT pour ${symbol} à ${price}`);
    // ➕ Ajoute ici ta logique d’achat réelle
  } else if (action === "exit") {
    console.log(`📤 VENTE pour ${symbol} à ${price}`);
    // ➕ Ajoute ici ta logique de vente réelle
  } else {
    console.log("❗ Action inconnue :", action);
    return res.status(400).json({ error: "Action non reconnue" });
  }

  res.status(200).json({ message: "Signal reçu et authentifié" });
});

app.listen(port, () => {
  console.log(`🟢 Serveur sécurisé lancé sur le port ${port}`);
});
