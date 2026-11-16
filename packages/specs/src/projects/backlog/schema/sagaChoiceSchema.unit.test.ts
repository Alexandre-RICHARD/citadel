import { describe, expect, it } from "vitest";

import { SagaChoiceKindEnum } from "../enum/sagaChoiceKind.enum.ts";
import { sagaChoiceSchema } from "./sagaChoiceSchema.ts";

describe("sagaChoiceSchema.ts", () => {
	describe("accepted choices", () => {
		it.each([
			{
				reason: "the proposed saga",
				value: { kind: SagaChoiceKindEnum.PROPOSED },
			},
			{
				reason: "another saga",
				value: { kind: SagaChoiceKindEnum.OTHER, sagaId: 4 },
			},
			{
				reason: "a new saga",
				value: { kind: SagaChoiceKindEnum.NEW, name: "Star Wars" },
			},
			{ reason: "no saga", value: { kind: SagaChoiceKindEnum.NONE } },
		])("SHOULD accept the choice WHEN it is $reason", ({ value }) => {
			expect(sagaChoiceSchema.safeParse(value)).toStrictEqual({
				success: true,
				data: value,
			});
		});
	});

	describe("rejected choices", () => {
		it.each([
			{ reason: "an unknown kind", value: { kind: "series" } },
			{
				reason: "another saga without id",
				value: { kind: SagaChoiceKindEnum.OTHER },
			},
			{
				reason: "a new saga with a blank name",
				value: { kind: SagaChoiceKindEnum.NEW, name: "  " },
			},
		])("SHOULD reject the choice WHEN it is $reason", ({ value }) => {
			expect(sagaChoiceSchema.safeParse(value).success).toBe(false);
		});
	});
});
