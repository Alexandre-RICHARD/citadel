import type { SagaChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/sagaChoiceKind.enum.ts";

export type SagaChoiceBean =
	| { kind: SagaChoiceKindEnum.PROPOSED }
	| { kind: SagaChoiceKindEnum.OTHER; sagaId: number }
	| { kind: SagaChoiceKindEnum.NEW; name: string }
	| { kind: SagaChoiceKindEnum.NONE };
