import type { CompanyFm } from "./companyFm.type";
import type { CustomizationFm } from "./customizationFm.type";
import type { DlcFm } from "./dlcFm.type";
import type { SeriesFm } from "./seriesFm.type";
import type { StoredVersionFm } from "./storedVersionFm.type";

// Un jeu en base : ses versions, ses DLC, et sa personnalisation s'il est dans le backlog
export type StoredGameFm = {
	id: number;
	name: string;
	frenchName: string | null;
	firstReleaseDate: string | null;
	isCancelled: boolean;
	igdbUrl: string;
	proposedSeries: SeriesFm | null;
	developer: CompanyFm | null;
	publisher: CompanyFm | null;
	versions: StoredVersionFm[];
	dlcs: DlcFm[];
	// null hors backlog
	customization: CustomizationFm | null;
};
