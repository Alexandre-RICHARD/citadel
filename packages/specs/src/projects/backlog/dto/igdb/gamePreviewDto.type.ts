import type { CompanyDto } from "../common/companyDto.type.ts";
import type { GamePreviewDlcDto } from "./gamePreviewDlcDto.type.ts";
import type { GamePreviewGameDto } from "./gamePreviewGameDto.type.ts";
import type { GamePreviewVersionDto } from "./gamePreviewVersionDto.type.ts";
import type { GamePreviewWarningDto } from "./gamePreviewWarningDto.type.ts";

/**
 * Modale du jeu : tout ce que l'enregistrement stockera, en lecture seule.
 * Pour un jeu déjà en base, ses données de la base, complétées des versions et DLC IGDB qui n'y sont pas
 */
export type GamePreviewDto = {
	game: GamePreviewGameDto;
	isStored: boolean;
	// Celle d'IGDB aujourd'hui ; pour un jeu en base, celle proposée à son ajout
	proposedSeriesName: string | null;
	developer: CompanyDto | null;
	publisher: CompanyDto | null;
	// L'originale d'abord, puis les autres dans l'ordre de sortie
	versions: GamePreviewVersionDto[];
	dlcs: GamePreviewDlcDto[];
	// Images proposées pour la miniature : la cover d'abord, puis les artworks
	imageIds: string[];
	warnings: GamePreviewWarningDto[];
};
