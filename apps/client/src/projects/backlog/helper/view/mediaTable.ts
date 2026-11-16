import { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum";
import { mediaColumnFilterKinds } from "@citadel/specs/src/projects/backlog/helper/view/mediaColumnFilterKinds";

import { mediaColumnLabels } from "../label/mediaColumnLabels";
import type { TableDefinition } from "./tableDefinition.type";

// Masquées par défaut, elles s'affichent par « Colonnes »
const HIDDEN_BY_DEFAULT: MediaColumnEnum[] = [MediaColumnEnum.TMDB_ID];

// Le tableau des films et séries, en mode classique : dans l'ordre de l'enum (§5)
export const mediaTable: TableDefinition<MediaColumnEnum> = {
	kinds: mediaColumnFilterKinds,
	defaultColumns: Object.values(MediaColumnEnum).map((key) => ({
		key,
		isVisible: !HIDDEN_BY_DEFAULT.includes(key),
	})),
	storageKey: "backlog.media.columns",
	actionsColumn: MediaColumnEnum.ACTIONS,
	labels: mediaColumnLabels,
	durationColumns: [MediaColumnEnum.RUNTIME],
};
