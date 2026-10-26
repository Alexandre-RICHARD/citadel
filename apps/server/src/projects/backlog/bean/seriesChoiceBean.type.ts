import type { SeriesChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/seriesChoiceKind.enum.ts";

export type SeriesChoiceBean =
	| { kind: SeriesChoiceKindEnum.PROPOSED }
	| { kind: SeriesChoiceKindEnum.OTHER; seriesId: number }
	| { kind: SeriesChoiceKindEnum.NEW; name: string }
	| { kind: SeriesChoiceKindEnum.NONE };
