import type { NasSharingEnum } from "../../enum/nasSharing.enum.ts";

// Un torrent lié au fichier, tel que la colonne « Torrents » l'affiche : son nom et le nom affiché de son tracker
export type NasTorrentDto = {
	name: string;
	trackerName: string | null;
	sharing: NasSharingEnum;
};
