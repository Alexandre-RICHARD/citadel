// Octets échangés sur une période (un jour, une semaine)
export type TorrentVolume = {
	// Début de la période, AAAA-MM-JJ (le lundi pour une semaine)
	period: string;
	downloaded: number;
	uploaded: number;
};
