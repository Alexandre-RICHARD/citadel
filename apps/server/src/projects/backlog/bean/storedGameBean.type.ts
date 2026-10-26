import type { CompanyBean } from "./companyBean.type.ts";
import type { CustomizationBean } from "./customizationBean.type.ts";
import type { DlcBean } from "./dlcBean.type.ts";
import type { SeriesBean } from "./seriesBean.type.ts";
import type { StoredVersionBean } from "./storedVersionBean.type.ts";

export type StoredGameBean = {
	id: number;
	name: string;
	frenchName: string | null;
	firstReleaseDate: string | null;
	isCancelled: boolean;
	igdbUrl: string;
	proposedSeries: SeriesBean | null;
	developer: CompanyBean | null;
	publisher: CompanyBean | null;
	versions: StoredVersionBean[];
	dlcs: DlcBean[];
	customization: CustomizationBean | null;
};
