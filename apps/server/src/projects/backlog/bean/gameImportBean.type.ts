import type { CompanyBean } from "./companyBean.type.ts";
import type { DlcBean } from "./dlcBean.type.ts";
import type { GameImportVersionBean } from "./gameImportVersionBean.type.ts";
import type { ImportWarningBean } from "./importWarningBean.type.ts";
import type { ProposedSeriesBean } from "./proposedSeriesBean.type.ts";

// Un jeu tel qu'IGDB le décrit, rangé comme la base le stockera (cahier des charges, §3 et §5)
export type GameImportBean = {
	game: {
		id: number;
		name: string;
		frenchName: string | null;
		firstReleaseDate: string | null;
		isCancelled: boolean;
		igdbUrl: string;
	};
	proposedSeries: ProposedSeriesBean | null;
	developer: CompanyBean | null;
	publisher: CompanyBean | null;
	// L'originale d'abord, puis les autres dans l'ordre de sortie
	versions: GameImportVersionBean[];
	dlcs: DlcBean[];
	// La cover de l'original d'abord, puis ses artworks
	imageIds: string[];
	warnings: ImportWarningBean[];
};
