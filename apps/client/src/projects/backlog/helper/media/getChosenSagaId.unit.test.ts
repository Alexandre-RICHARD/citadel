import { SagaChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/sagaChoiceKind.enum";
import { describe, expect, it } from "vitest";

import { getChosenSagaId } from "./getChosenSagaId";

const SAGAS = [
	{ id: 1, name: "Star Wars" },
	{ id: 2, name: "Le Seigneur des anneaux" },
];

describe("getChosenSagaId.ts", () => {
	describe("proposed saga", () => {
		it("SHOULD give the saga linked to the TMDB collection", () => {
			expect(
				getChosenSagaId(
					{ kind: SagaChoiceKindEnum.PROPOSED },
					{ sagaId: 1, name: "Star Wars" },
					SAGAS,
				),
			).toBe(1);
		});

		it("SHOULD give the saga of the same name WHEN the collection is linked to none", () => {
			expect(
				getChosenSagaId(
					{ kind: SagaChoiceKindEnum.PROPOSED },
					{ sagaId: null, name: "star wars" },
					SAGAS,
				),
			).toBe(1);
		});

		it("SHOULD give no saga WHEN TMDB proposes none", () => {
			expect(
				getChosenSagaId({ kind: SagaChoiceKindEnum.PROPOSED }, null, SAGAS),
			).toBeNull();
		});
	});

	describe("new saga", () => {
		it("SHOULD give the existing saga WHEN its name is taken, ignoring accents and case", () => {
			expect(
				getChosenSagaId(
					{ kind: SagaChoiceKindEnum.NEW, name: "le seigneur des ANNEAUX" },
					null,
					SAGAS,
				),
			).toBe(2);
		});

		it("SHOULD give a saga still to create WHEN the name is new", () => {
			expect(
				getChosenSagaId(
					{ kind: SagaChoiceKindEnum.NEW, name: "Alien" },
					null,
					SAGAS,
				),
			).toBeUndefined();
		});
	});
});
