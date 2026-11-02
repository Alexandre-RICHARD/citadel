// Les jobs d'infra-ops que la console montre et sait lancer, dans l'ordre d'affichage.
// Les noms sont ceux de `citadel <job>` (infra/citadel, infra/ops/crontab).
// monitored : le job a son contrôle chez healthchecks.io
export const JOB_DEFINITIONS = [
	{
		name: "site-check",
		label: "Site en ligne",
		description: "Le site répond depuis Internet",
		monitored: true,
	},
	{
		name: "db-backup",
		label: "Sauvegarde de la base",
		description: "Dump, copie sur le HDD et le Drive",
		monitored: true,
	},
	{
		name: "db-restore-test",
		label: "Test de restauration",
		description: "Le dump de la nuit, restauré en pré-prod et contrôlé",
		monitored: true,
	},
	{
		name: "config-backup",
		label: "Sauvegarde des configs",
		description: "Archive de /Volume1/appdata, services média arrêtés",
		monitored: true,
	},
	{
		name: "config-verify",
		label: "Contrôle des configs",
		description: "Bases SQLite et fichiers clés de la dernière archive",
		monitored: true,
	},
	{
		name: "vpn-leak-test",
		label: "Test de fuite du VPN",
		description: "IP de sortie et DNS des téléchargements",
		monitored: true,
	},
	{
		name: "update-check",
		label: "Mises à jour disponibles",
		description:
			"Vérifier les nouvelles versions disponibles des images utilisées",
		monitored: false,
	},
	{
		name: "storage-stats",
		label: "Tailles du stockage",
		description: "Docker, configs, sauvegardes et base du site",
		monitored: false,
	},
	{
		name: "qbittorrent-stats",
		label: "Compteurs qBittorrent",
		description: "Volumes échangés, pour l'historique",
		monitored: false,
	},
	{
		name: "auto-stop",
		label: "Arrêt automatique",
		description: "Les *arr et cross-seed, 3 h après leur démarrage",
		monitored: false,
	},
	{
		name: "log-retention",
		label: "Logs à 90 jours",
		description: "Vide les logs dont la plus vieille ligne a plus de 90 jours",
		monitored: false,
	},
	{
		name: "contact-retry",
		label: "Messages de contact en attente",
		description:
			"Renvoie ceux dont l'email n'était pas parti, tant que le quota le permet",
		monitored: false,
	},
] as const;
