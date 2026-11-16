import { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum";
import { NasColumnEnum } from "@citadel/specs/src/projects/backlog/enum/nasColumn.enum";
import type { ConnectedMediaColumn } from "@citadel/specs/src/projects/backlog/helper/view/connectedMediaColumn.type";
import { connectedMediaColumnFilterKinds } from "@citadel/specs/src/projects/backlog/helper/view/connectedMediaColumnFilterKinds";

import { mediaColumnLabels } from "../label/mediaColumnLabels";
import { nasColumnLabels } from "../label/nasColumnLabels";
import type { TableDefinition } from "./tableDefinition.type";

// Après « À voir bientôt » viennent les colonnes du NAS, puis l'identifiant TMDB et les actions (§5)
const COMMON_COLUMNS = Object.values(MediaColumnEnum).filter(
	(column) =>
		column !== MediaColumnEnum.TMDB_ID && column !== MediaColumnEnum.ACTIONS,
);
const ORDER: ConnectedMediaColumn[] = [
	...COMMON_COLUMNS,
	...Object.values(NasColumnEnum),
	MediaColumnEnum.TMDB_ID,
	MediaColumnEnum.ACTIONS,
];
// Masquées par défaut, elles s'affichent par « Colonnes » : les noms des torrents sont longs
const HIDDEN_BY_DEFAULT: ConnectedMediaColumn[] = [
	MediaColumnEnum.TMDB_ID,
	NasColumnEnum.TORRENTS,
];

// Le tableau des films et séries en mode connecté, avec les colonnes du NAS ; sa disposition est gardée à part
export const connectedMediaTable: TableDefinition<ConnectedMediaColumn> = {
	kinds: connectedMediaColumnFilterKinds,
	defaultColumns: ORDER.map((key) => ({
		key,
		isVisible: !HIDDEN_BY_DEFAULT.includes(key),
	})),
	storageKey: "backlog.media.connected.columns",
	actionsColumn: MediaColumnEnum.ACTIONS,
	labels: { ...mediaColumnLabels, ...nasColumnLabels },
	durationColumns: [MediaColumnEnum.RUNTIME],
};
