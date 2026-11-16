import { SagaChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/sagaChoiceKind.enum";
import { describe, expect, it } from "vitest";

import { resolveOptimisticSaga } from "./resolveOptimisticSaga";

describe("resolveOptimisticSaga.ts", () => {
	describe("choices", () => {
		const sagas = [{ id: 1, name: "Star Wars" }];

		it.each([
			{
				reason: "the proposed saga linked to its collection",
				choice: { kind: SagaChoiceKindEnum.PROPOSED } as const,
				proposed: { sagaId: 1, name: "Star Wars" },
				expected: { id: 1, name: "Star Wars" },
			},
			{
				reason: "a new saga whose name is taken",
				choice: { kind: SagaChoiceKindEnum.NEW, name: "star wars" } as const,
				proposed: null,
				expected: { id: 1, name: "Star Wars" },
			},
			{
				reason: "a new saga",
				choice: { kind: SagaChoiceKindEnum.NEW, name: "Alien" } as const,
				proposed: null,
				expected: { id: -5, name: "Alien" },
			},
			{
				reason: "no saga",
				choice: { kind: SagaChoiceKindEnum.NONE } as const,
				proposed: null,
				expected: null,
			},
		])(
			"SHOULD give the saga WHEN the choice is $reason",
			({ choice, proposed, expected }) => {
				expect(
					resolveOptimisticSaga(choice, proposed, sagas, -5),
				).toStrictEqual(expected);
			},
		);
	});
});
