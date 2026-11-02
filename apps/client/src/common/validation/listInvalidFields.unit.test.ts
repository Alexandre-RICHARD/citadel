import { describe, expect, it } from "vitest";
import { z } from "zod";

import { listInvalidFields } from "./listInvalidFields";

const schema = z.object({
	name: z.string().min(1),
	email: z.email(),
	age: z.number().int(),
});

describe("listInvalidFields.ts", () => {
	describe("valid input", () => {
		it("SHOULD list nothing WHEN every field is right", () => {
			expect(
				listInvalidFields(schema, {
					name: "Alex",
					email: "alex@example.com",
					age: 30,
				}),
			).toStrictEqual(new Set());
		});
	});

	describe("invalid input", () => {
		it("SHOULD list every refused field, once each", () => {
			expect(
				listInvalidFields(schema, { name: "", email: "alex@", age: 1.5 }),
			).toStrictEqual(new Set(["name", "email", "age"]));
		});
	});
});
