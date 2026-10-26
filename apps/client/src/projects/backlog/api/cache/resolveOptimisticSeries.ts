import { normalizeText } from "@citadel/common/src/universal/string/normalizeText";
import type { SeriesDto } from "@citadel/specs/src/projects/backlog/dto/common/seriesDto.type";
import type { CreateUserGameBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userGames/createUserGame/createUserGameBodyDto.type";
import { SeriesChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/seriesChoiceKind.enum";

/**
 * La série choisie, en attendant celle du serveur : la proposée, une autre de la base, ou une nouvelle (une série de même
 * nom, sans accents ni majuscules, sinon une série provisoire d'id négatif)
 */
export function resolveOptimisticSeries(
	choice: CreateUserGameBodyDto["customization"]["series"],
	proposedSeries: SeriesDto | null,
	allSeries: SeriesDto[],
	temporaryId: number,
): SeriesDto | null {
	switch (choice.kind) {
		case SeriesChoiceKindEnum.PROPOSED:
			return proposedSeries;
		case SeriesChoiceKindEnum.OTHER:
			return allSeries.find(({ id }) => id === choice.seriesId) ?? null;
		case SeriesChoiceKindEnum.NEW:
			return (
				allSeries.find(
					({ name }) => normalizeText(name) === normalizeText(choice.name),
				) ?? { id: temporaryId, name: choice.name }
			);
		default:
			return null;
	}
}
