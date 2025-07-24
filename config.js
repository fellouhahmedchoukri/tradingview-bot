// Configuration du Bot TradingView -> Binance
const config = {
  // Clé API Binance (à générer sur https://www.binance.com/en/my/settings/api-management)
  BINANCE_API_KEY: 'f221b115088ca216ba256945dde2f963e45ebb7e213d98e20230f1a71e57d206', // Ex: 'xYz123abc456def789ghi'
  
  // Clé secrète Binance (à garder absolument privée)
  BINANCE_API_SECRET: '049578f1adb71d0379dd1b5ccdf76cf58017acc31363f502b5d61cd995ef00b1', // Ex: 'AbC987def654ghi321jkl'
  
  // Port local pour le webhook (ne pas changer sauf conflit)
  WEBHOOK_PORT: 3000,
  
  // Clé secrète pour authentifier les requêtes TradingView (choisissez une phrase complexe)
  SIGNING_KEY: '#1960AlGeR@+=' // Ex: 'MaCleSecret#2025@TradingBot'
};

// Exportation obligatoire pour Node.js
export default config;