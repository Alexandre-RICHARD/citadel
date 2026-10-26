import type { CompanyFm } from "./companyFm.type";
import type { GamePreviewDlcFm } from "./gamePreviewDlcFm.type";
import type { GamePreviewVersionFm } from "./gamePreviewVersionFm.type";
import type { GamePreviewWarningFm } from "./gamePreviewWarningFm.type";

// La modale du jeu : ce que l'enregistrement stockera, ou ce qui est déjà en base
export type GamePreviewFm = {
	game: {
		id: number;
		name: string;
		frenchName: string | null;
		firstReleaseDate: string | null;
		isCancelled: boolean;
		igdbUrl: string;
	};
	isStored: boolean;
	proposedSeriesName: string | null;
	developer: CompanyFm | null;
	publisher: CompanyFm | null;
	versions: GamePreviewVersionFm[];
	dlcs: GamePreviewDlcFm[];
	imageIds: string[];
	warnings: GamePreviewWarningFm[];
};
