import type { ConnectedMediaColumn } from "@citadel/specs/src/projects/backlog/helper/view/connectedMediaColumn.type";

import type { NasStatusFm } from "../../api/model/nas/nasStatusFm.type";
import type { TableDefinition } from "../../helper/view/tableDefinition.type";

// Le mode du tableau : classique (nas null) ou connecté, avec ses colonnes
export type MediaMode = {
	table: TableDefinition<ConnectedMediaColumn>;
	nas: NasStatusFm | null;
};
