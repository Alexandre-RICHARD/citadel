import { externalLinks } from "../../../../links/externalLinks.ts";

/** Adresse de la page d'un jeu (ou d'un DLC, d'une version) sur IGDB, à partir de son identifiant ou de son slug */
export function buildIgdbGameUrl(gameKey: number | string): string {
	return `${externalLinks.igdb}games/${gameKey}`;
}
