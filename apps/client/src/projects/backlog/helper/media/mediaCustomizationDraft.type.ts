import type { SagaChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/sagaChoiceKind.enum";

/**
 * Personnalisation d'un film ou d'une série en saisie, à l'ajout ou par « Personnaliser » : la forme du corps envoyé
 * (mediaCustomizationSchema). `sagaNumber` null : après les autres médias de la saga
 */
export type MediaCustomizationDraft = {
	imagePath: string | null;
	saga:
		| { kind: SagaChoiceKindEnum.PROPOSED }
		| { kind: SagaChoiceKindEnum.OTHER; sagaId: number }
		| { kind: SagaChoiceKindEnum.NEW; name: string }
		| { kind: SagaChoiceKindEnum.NONE };
	sagaNumber: number | null;
};
