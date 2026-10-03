import { describe, expect, it } from "vitest";
import { z } from "zod";

import { checkInput } from "./checkInput";

const schema = z.object({
	name: z.string().trim().min(1).max(5),
	comment: z
		.string()
		.trim()
		.transform((value) => (value === "" ? null : value)),
});

const FIELD_LABELS = { name: "le nom" };

describe("checkInput.ts", () => {
	describe("valid input", () => {
		it("SHOULD return the cleaned schema output", () => {
			expect(
				checkInput(schema, { name: " Hades ", comment: "  " }, FIELD_LABELS),
			).toStrictEqual({
				isValid: true,
				data: { name: "Hades", comment: null },
			});
		});
	});

	describe("invalid input", () => {
		it("SHOULD name the field in a French sentence WHEN its label is known", () => {
			expect(
				checkInput(schema, { name: "Hades II", comment: "" }, FIELD_LABELS),
			).toStrictEqual({
				isValid: false,
				message: "Le nom doit contenir au plus 5 caractères.",
			});
		});

		it("SHOULD keep the rule alone WHEN the field has no label", () => {
			expect(
				checkInput(schema, { name: "Hades II", comment: "" }, {}),
			).toStrictEqual({
				isValid: false,
				message: "Doit contenir au plus 5 caractères.",
			});
		});
	});
});
