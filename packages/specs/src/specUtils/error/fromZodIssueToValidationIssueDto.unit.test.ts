import { describe, expect, it } from "vitest";
import { z } from "zod";

import { fromZodIssueToValidationIssueDto } from "./fromZodIssueToValidationIssueDto.ts";
import { ValidationIssueCodeEnum } from "./validationIssueCode.enum.ts";

const MESSAGE = "Refused";

function mapIssues(schema: z.ZodType, value: unknown) {
	const result = schema.safeParse(value);
	return result.success
		? []
		: result.error.issues.map(fromZodIssueToValidationIssueDto);
}

describe("fromZodIssueToValidationIssueDto.ts", () => {
	describe("native zod rules", () => {
		it.each([
			{
				reason: "a value of the wrong type",
				schema: z.string({ message: MESSAGE }),
				value: 42,
				rule: { code: ValidationIssueCodeEnum.INVALID_TYPE },
			},
			{
				reason: "a decimal where an integer is expected",
				schema: z.number().int({ message: MESSAGE }),
				value: 1.5,
				rule: { code: ValidationIssueCodeEnum.NOT_INTEGER },
			},
			{
				reason: "a text below its minimum length",
				schema: z.string().min(3, { message: MESSAGE }),
				value: "ab",
				rule: { code: ValidationIssueCodeEnum.TOO_SHORT, limit: 3 },
			},
			{
				reason: "a text beyond its maximum length",
				schema: z.string().max(2, { message: MESSAGE }),
				value: "abc",
				rule: { code: ValidationIssueCodeEnum.TOO_LONG, limit: 2 },
			},
			{
				reason: "a number below its minimum",
				schema: z.number().min(5, { message: MESSAGE }),
				value: 4,
				rule: { code: ValidationIssueCodeEnum.TOO_SMALL, limit: 5 },
			},
			{
				reason: "a number beyond its maximum",
				schema: z.number().max(5, { message: MESSAGE }),
				value: 6,
				rule: { code: ValidationIssueCodeEnum.TOO_BIG, limit: 5 },
			},
			{
				reason: "a text not matching a regex",
				schema: z.string().regex(/^\d+$/, { message: MESSAGE }),
				value: "abc",
				rule: { code: ValidationIssueCodeEnum.INVALID_FORMAT },
			},
			{
				reason: "a text that is not an ISO datetime",
				schema: z.iso.datetime({ message: MESSAGE }),
				value: "yesterday",
				rule: { code: ValidationIssueCodeEnum.INVALID_FORMAT },
			},
			{
				reason: "a rule without dedicated code",
				schema: z.enum(["Elden Ring"], { message: MESSAGE }),
				value: "Sekiro",
				rule: { code: ValidationIssueCodeEnum.INVALID_VALUE },
			},
		])(
			"SHOULD give the matching rule WHEN zod refuses $reason",
			({ schema, value, rule }) => {
				expect(mapIssues(schema, value)).toStrictEqual([
					{ path: [], ...rule, message: MESSAGE },
				]);
			},
		);
	});

	describe("custom rules", () => {
		it("SHOULD give the code set in params WHEN a refine declares one", () => {
			const schema = z.string().refine(() => false, {
				message: MESSAGE,
				params: { code: ValidationIssueCodeEnum.FUTURE_DATE },
			});

			expect(mapIssues(schema, "2999-01-01")).toStrictEqual([
				{
					path: [],
					code: ValidationIssueCodeEnum.FUTURE_DATE,
					message: MESSAGE,
				},
			]);
		});

		it.each([
			{ reason: "declares no code", params: undefined },
			{ reason: "declares an unknown code", params: { code: "UNKNOWN" } },
		])(
			"SHOULD fall back to INVALID_VALUE WHEN a refine $reason",
			({ params }) => {
				const schema = z
					.string()
					.refine(() => false, { message: MESSAGE, params });

				expect(mapIssues(schema, "Hades")).toStrictEqual([
					{
						path: [],
						code: ValidationIssueCodeEnum.INVALID_VALUE,
						message: MESSAGE,
					},
				]);
			},
		);
	});

	describe("paths", () => {
		it("SHOULD keep the full path WHEN the refused field is nested", () => {
			const schema = z.object({
				deaths: z.array(z.object({ comment: z.string({ message: MESSAGE }) })),
			});

			expect(mapIssues(schema, { deaths: [{ comment: 7 }] })).toStrictEqual([
				{
					path: ["deaths", 0, "comment"],
					code: ValidationIssueCodeEnum.INVALID_TYPE,
					message: MESSAGE,
				},
			]);
		});
	});
});
