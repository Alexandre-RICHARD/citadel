import { normalizeText } from "@citadel/common/src/universal/string/normalizeText";
import { SagaChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/sagaChoiceKind.enum";

import type { SagaFm } from "../../api/model/media/sagaFm.type";
import type { MediaCustomizationDraft } from "./mediaCustomizationDraft.type";

/**
 * Saga que désigne un choix : null sans saga, undefined pour une saga encore à créer. Un nom déjà pris, sans tenir compte
 * des accents ni des majuscules, désigne la saga existante, comme côté serveur ; la saga proposée par la collection TMDB
 * d'un film est celle qui lui est reliée, sinon une nouvelle à son nom
 */
export function getChosenSagaId(
	choice: MediaCustomizationDraft["saga"],
	proposedSaga: { sagaId: number | null; name: string } | null,
	sagas: SagaFm[],
): number | null | undefined {
	function findByName(name: string): number | undefined {
		return sagas.find(
			(saga) => normalizeText(saga.name) === normalizeText(name),
		)?.id;
	}
	switch (choice.kind) {
		case SagaChoiceKindEnum.PROPOSED:
			if (proposedSaga === null) return null;
			return proposedSaga.sagaId ?? findByName(proposedSaga.name);
		case SagaChoiceKindEnum.OTHER:
			return choice.sagaId;
		case SagaChoiceKindEnum.NEW:
			return findByName(choice.name);
		default:
			return null;
	}
}
