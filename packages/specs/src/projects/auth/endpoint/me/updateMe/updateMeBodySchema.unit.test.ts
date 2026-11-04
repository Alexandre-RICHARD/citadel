import { describe, expect, it } from "vitest";

import { ValidationIssueCodeEnum } from "../../../../../specUtils/error/validationIssueCode.enum.ts";
import { getIssues } from "../../../../../testUtils/getIssues.ts";
import { LoginMethodEnum } from "../../../enum/loginMethod.enum.ts";
import { updateMeBodySchema } from "./updateMeBodySchema.ts";

describe("updateMeBodySchema.ts", () => {
	describe("accepted bodies", () => {
		it("SHOULD accept the display name alone, cleaned", () => {
			expect(
				updateMeBodySchema.parse({ displayName: "  Élodie   B " }),
			).toStrictEqual({ displayName: "Élodie B" });
		});

		it("SHOULD turn an empty display name into null WHEN the username must take its place", () => {
			expect(updateMeBodySchema.parse({ displayName: "  " })).toStrictEqual({
				displayName: null,
			});
		});

		it("SHOULD accept the login methods alone", () => {
			expect(
				updateMeBodySchema.parse({ loginMethods: LoginMethodEnum.MAIL }),
			).toStrictEqual({ loginMethods: LoginMethodEnum.MAIL });
		});
	});

	describe("refused bodies", () => {
		it("SHOULD refuse an empty body", () => {
			expect(getIssues(updateMeBodySchema.safeParse({}))).toMatchObject([
				{ code: ValidationIssueCodeEnum.MISSING_FIELDS },
			]);
		});

		it("SHOULD refuse unknown login methods", () => {
			expect(
				updateMeBodySchema.safeParse({ loginMethods: "sms" }).success,
			).toBe(false);
		});
	});
});
