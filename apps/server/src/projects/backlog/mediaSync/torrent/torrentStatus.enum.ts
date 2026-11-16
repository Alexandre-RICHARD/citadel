// L'état d'un torrent au passage du job (§8, étape 2)
export enum TorrentStatusEnum {
	// Une de ses adresses fonctionne
	VALID = "valid",
	// Son tracker ne répond à aucun torrent, il n'a pas encore été contacté, ou qBittorrent le dit en erreur : revu au
	// passage suivant, jamais déclaré mort
	INACTIVE = "inactive",
	// Son tracker répond à d'autres torrents, mais aucune de ses adresses ne fonctionne pour celui-ci
	DEAD = "dead",
}
