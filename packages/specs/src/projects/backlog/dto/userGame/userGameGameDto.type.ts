import type { CompanyDto } from "../common/companyDto.type.ts";
import type { SeriesDto } from "../common/seriesDto.type.ts";

// Données du jeu affichées sur sa ligne du backlog
export type UserGameGameDto = {
	id: number;
	name: string;
	frenchName: string | null;
	firstReleaseDate: string | null;
	isCancelled: boolean;
	igdbUrl: string;
	developer: CompanyDto | null;
	publisher: CompanyDto | null;
	// Un crayon quand la série choisie en diffère
	proposedSeries: SeriesDto | null;
};
