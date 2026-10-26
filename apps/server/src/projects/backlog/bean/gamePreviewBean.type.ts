import type { CompanyBean } from "./companyBean.type.ts";
import type { GameImportBean } from "./gameImportBean.type.ts";
import type { GamePreviewDlcBean } from "./gamePreviewDlcBean.type.ts";
import type { GamePreviewVersionBean } from "./gamePreviewVersionBean.type.ts";
import type { ImportWarningBean } from "./importWarningBean.type.ts";

export type GamePreviewBean = {
	game: GameImportBean["game"];
	isStored: boolean;
	proposedSeriesName: string | null;
	developer: CompanyBean | null;
	publisher: CompanyBean | null;
	versions: GamePreviewVersionBean[];
	dlcs: GamePreviewDlcBean[];
	imageIds: string[];
	warnings: ImportWarningBean[];
};
