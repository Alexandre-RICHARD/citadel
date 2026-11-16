// Colonnes relevées sur le NAS, qui n'existent qu'en mode connecté (§5), dans l'ordre par défaut : elles suivent « Vu »
// et « À voir bientôt », en commençant par « Vérifié ». Leur clé nomme aussi leur filtre dans l'URL et dans la query
export enum NasColumnEnum {
	VERIFIED = "verified",
	STORAGE = "storage",
	JELLYFIN_COLLECTION = "jellyfinCollection",
	SHARING = "sharing",
	TORRENTS = "torrents",
	QUALITY = "quality",
	LANGUAGES = "languages",
	SIZE = "size",
	GB_PER_HOUR = "gbPerHour",
	GAPS = "gaps",
}
