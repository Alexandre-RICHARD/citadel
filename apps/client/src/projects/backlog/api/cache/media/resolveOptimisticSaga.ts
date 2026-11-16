import { normalizeText } from "@citadel/common/src/universal/string/normalizeText";
import type { SagaDto } from "@citadel/specs/src/projects/backlog/dto/saga/sagaDto.type";
import type { CreateUserMediaBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/createUserMedia/createUserMediaBodyDto.type";
import { SagaChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/sagaChoiceKind.enum";

/**
 * La saga choisie, en attendant celle du serveur : la proposée (reliée à la collection TMDB du film, sinon une nouvelle à son
 * nom), une autre du compte, ou une nouvelle. Un nom déjà pris, sans accents ni majuscules, désigne la saga existante ;
 * sinon une saga provisoire, d'id négatif
 */
export function resolveOptimisticSaga(
	choice: CreateUserMediaBodyDto["customization"]["saga"],
	proposedSaga: { sagaId: number | null; name: string } | null,
	sagas: SagaDto[],
	temporaryId: number,
): SagaDto | null {
	function findOrCreate(name: string): SagaDto {
		return (
			sagas.find(
				(saga) => normalizeText(saga.name) === normalizeText(name),
			) ?? {
				id: temporaryId,
				name,
			}
		);
	}
	switch (choice.kind) {
		case SagaChoiceKindEnum.PROPOSED:
			if (proposedSaga === null) return null;
			return proposedSaga.sagaId === null
				? findOrCreate(proposedSaga.name)
				: { id: proposedSaga.sagaId, name: proposedSaga.name };
		case SagaChoiceKindEnum.OTHER:
			return sagas.find(({ id }) => id === choice.sagaId) ?? null;
		case SagaChoiceKindEnum.NEW:
			return findOrCreate(choice.name);
		default:
			return null;
	}
}
