// Émis sur window quand l'API répond 401 (session expirée, console redémarrée) : App
// revient alors au formulaire de connexion, d'où que vienne la requête
export const UNAUTHORIZED_EVENT = "citadel-admin:unauthorized";
