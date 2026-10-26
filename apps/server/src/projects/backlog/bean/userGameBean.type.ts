import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";

import type { CompanyBean } from "./companyBean.type.ts";
import type { DlcBean } from "./dlcBean.type.ts";
import type { SeriesBean } from "./seriesBean.type.ts";
import type { UserVersionBean } from "./userVersionBean.type.ts";

// Une ligne du backlog, telle qu'elle est stockée ; ses agrégats se calculent
export type UserGameBean = {
	game: {
		id: number;
		name: string;
		frenchName: string | null;
		firstReleaseDate: string | null;
		isCancelled: boolean;
		igdbUrl: string;
		developer: CompanyBean | null;
		publisher: CompanyBean | null;
		proposedSeries: SeriesBean | null;
	};
	imageId: string | null;
	endingType: EndingTypeEnum;
	series: SeriesBean | null;
	seriesNumber: number | null;
	seriesNumberLabel: string | null;
	dlcs: DlcBean[];
	userVersions: UserVersionBean[];
};
