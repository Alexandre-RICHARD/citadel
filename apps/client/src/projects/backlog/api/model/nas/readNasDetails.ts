import type { NasDetailsFm } from "./nasDetailsFm.type";

// Les colonnes du NAS d'une ligne, d'une saison ou d'un épisode du mode connecté ; null en mode classique (pas de champ)
export function readNasDetails(item: object): NasDetailsFm | null {
	return "nas" in item ? (item.nas as NasDetailsFm | null) : null;
}
