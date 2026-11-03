import { SecondFactorMethodEnum } from "@citadel/specs/src/projects/auth/enum/secondFactorMethod.enum";
import { describe, expect, it } from "vitest";

import { pickSecondFactorMethod } from "./pickSecondFactorMethod";

const { TOTP, EMAIL, RECOVERY_CODE } = SecondFactorMethodEnum;

describe("pickSecondFactorMethod.ts", () => {
	describe("nothing chosen", () => {
		it("SHOULD give the first method offered", () => {
			expect(
				pickSecondFactorMethod({
					offered: [EMAIL, RECOVERY_CODE],
					chosen: null,
					isMailOpen: true,
				}),
			).toBe(EMAIL);
		});

		it("SHOULD skip the email code WHEN no mail leaves any more today", () => {
			expect(
				pickSecondFactorMethod({
					offered: [EMAIL, RECOVERY_CODE],
					chosen: null,
					isMailOpen: false,
				}),
			).toBe(RECOVERY_CODE);
		});

		it("SHOULD keep the email code WHEN it is the only method offered", () => {
			expect(
				pickSecondFactorMethod({
					offered: [EMAIL],
					chosen: null,
					isMailOpen: false,
				}),
			).toBe(EMAIL);
		});

		it("SHOULD give null WHEN the step offers nothing", () => {
			expect(
				pickSecondFactorMethod({ offered: [], chosen: null, isMailOpen: true }),
			).toBeNull();
		});
	});

	describe("method chosen", () => {
		it("SHOULD keep the chosen method WHEN it is still offered", () => {
			expect(
				pickSecondFactorMethod({
					offered: [TOTP, RECOVERY_CODE],
					chosen: RECOVERY_CODE,
					isMailOpen: true,
				}),
			).toBe(RECOVERY_CODE);
		});

		it("SHOULD fall back on the first method WHEN the chosen one is no longer offered", () => {
			expect(
				pickSecondFactorMethod({
					offered: [TOTP],
					chosen: RECOVERY_CODE,
					isMailOpen: true,
				}),
			).toBe(TOTP);
		});
	});
});
