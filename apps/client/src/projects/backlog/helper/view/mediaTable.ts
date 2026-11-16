import { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum";
import { NasColumnEnum } from "@citadel/specs/src/projects/backlog/enum/nasColumn.enum";
import type { ConnectedMediaColumn } from "@citadel/specs/src/projects/backlog/helper/view/connectedMediaColumn.type";
import { mediaColumnFilterKinds } from "@citadel/specs/src/projects/backlog/helper/view/mediaColumnFilterKinds";

import { mediaColumnLabels } from "../label/mediaColumnLabels";
import { nasColumnLabels } from "../label/nasColumnLabels";
import type { TableDefinition } from "./tableDefinition.type";

// Masquées par défaut, elles s'affichent par « Colonnes »
const HIDDEN_BY_DEFAULT: MediaColumnEnum[] = [MediaColumnEnum.TMDB_ID];

/**
 * Le tableau des films et séries, en mode classique : dans l'ordre de l'enum (§5). Les colonnes du NAS n'y existent pas :
 * ni affichées, ni filtrées, ni triées (un filtre du NAS dans l'URL est ignoré)
 */
export const mediaTable: TableDefinition<ConnectedMediaColumn> = {
	kinds: {
		...mediaColumnFilterKinds,
		...Object.fromEntries(
			Object.values(NasColumnEnum).map((column) => [column, null]),
		),
	} as TableDefinition<ConnectedMediaColumn>["kinds"],
	defaultColumns: Object.values(MediaColumnEnum).map((key) => ({
		key,
		isVisible: !HIDDEN_BY_DEFAULT.includes(key),
	})),
	storageKey: "backlog.media.columns",
	actionsColumn: MediaColumnEnum.ACTIONS,
	labels: { ...mediaColumnLabels, ...nasColumnLabels },
	durationColumns: [MediaColumnEnum.RUNTIME],
};
