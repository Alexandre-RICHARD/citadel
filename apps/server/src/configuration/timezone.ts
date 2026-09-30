// TZ est lue par Node : cela fixe le fuseau "local" de toutes les dates du process.
// Tout le back fonctionne en UTC, c'est au client d'adapter l'affichage
process.env.TZ = "UTC";
