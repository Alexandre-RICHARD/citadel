import type { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";

import type { BacklogRowFm } from "../../../../api/model/backlogRowFm.type";
import type { TableControls } from "../../tableControls.type";

export type GameRowGroupProps = {
	row: BacklogRowFm;
	columns: BacklogColumnEnum[];
	// Alignement et colonnes collantes
	cellClassNames: Partial<Record<BacklogColumnEnum, string>>;
	isExpanded: boolean;
	table: TableControls;
};
