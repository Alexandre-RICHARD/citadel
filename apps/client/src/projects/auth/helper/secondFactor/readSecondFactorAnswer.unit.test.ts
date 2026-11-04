import { SecondFactorMethodEnum } from "@citadel/specs/src/projects/auth/enum/secondFactorMethod.enum";
import { describe, expect, it } from "vitest";

import { readSecondFactorAnswer } from "./readSecondFactorAnswer";

describe("readSecondFactorAnswer.ts", () => {
	describe("application code", () => {
		it.each(["123456", " 123 456 "])(
			"SHOULD read %j as an application code without its spaces",
			(typed) => {
				expect(readSecondFactorAnswer(typed)).toStrictEqual({
					method: SecondFactorMethodEnum.TOTP,
					code: "123456",
				});
			},
		);
	});

	describe("recovery code", () => {
		it.each(["ABCDE-FGHIJ", "abcde fghij", "ABCDEFGHIJ"])(
			"SHOULD read %j as a recovery code without its dash or spaces",
			(typed) => {
				expect(readSecondFactorAnswer(typed)).toMatchObject({
					method: SecondFactorMethodEnum.RECOVERY_CODE,
					code: typed.replace(/[\s-]/gu, ""),
				});
			},
		);
	});

	describe("nothing typed", () => {
		it.each(["", "  ", "-"])("SHOULD read %j as no answer", (typed) => {
			expect(readSecondFactorAnswer(typed)).toBeNull();
		});
	});
});
