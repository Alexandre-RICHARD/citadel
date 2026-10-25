// Une lecture en cours sur Jellyfin
export type JellyfinPlayback = {
	user: string;
	// L'appareil et l'application : « Pixel 8 · Jellyfin Android »
	device: string;
	// « Série — Épisode », ou le titre du film
	title: string;
	paused: boolean;
	// Le NAS recode la vidéo (plus de CPU) au lieu de l'envoyer telle quelle
	transcoding: boolean;
	// Avancement de 0 à 1 ; null si la durée est inconnue
	progress: number | null;
};
