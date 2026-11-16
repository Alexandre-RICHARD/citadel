// État de partage d'un fichier d'après ses torrents au dernier relevé (§5), du meilleur au moins bon : un fichier prend le
// meilleur état de ses torrents, une saison ou une série le meilleur de ses épisodes
export enum NasSharingEnum {
	// Tracker joint, torrent connu
	SEEDING = "seeding",
	// Le tracker ne répond pas : torrent inactif, revu au passage suivant
	TRACKER_UNREACHABLE = "tracker_unreachable",
	// Le tracker répond, mais ne connaît plus le torrent
	ERROR = "error",
	// Aucun torrent sur ce fichier
	NONE = "none",
}
