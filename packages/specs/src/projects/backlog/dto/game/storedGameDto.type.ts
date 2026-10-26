import type { CompanyDto } from "../common/companyDto.type.ts";
import type { DlcDto } from "../common/dlcDto.type.ts";
import type { SeriesDto } from "../common/seriesDto.type.ts";
import type { CustomizationDto } from "./customizationDto.type.ts";
import type { StoredVersionDto } from "./storedVersionDto.type.ts";

// Un jeu en base, avec sa personnalisation s'il est dans le backlog
export type StoredGameDto = {
	id: number;
	name: string;
	frenchName: string | null;
	firstReleaseDate: string | null;
	isCancelled: boolean;
	igdbUrl: string;
	proposedSeries: SeriesDto | null;
	developer: CompanyDto | null;
	publisher: CompanyDto | null;
	// L'originale d'abord, puis les autres dans l'ordre de sortie
	versions: StoredVersionDto[];
	dlcs: DlcDto[];
	// null hors backlog
	customization: CustomizationDto | null;
};
