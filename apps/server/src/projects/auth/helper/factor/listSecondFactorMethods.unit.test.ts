import { FactorTypeEnum } from "@citadel/specs/src/projects/auth/enum/factorType.enum.ts";
import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import { SecondFactorMethodEnum } from "@citadel/specs/src/projects/auth/enum/secondFactorMethod.enum.ts";
import { describe, expect, it } from "vitest";

import { listSecondFactorMethods } from "./listSecondFactorMethods.ts";

const BOTH_FACTORS = [
	FactorTypeEnum.TOTP,
	FactorTypeEnum.TOTP,
	FactorTypeEnum.EMAIL,
];

describe("listSecondFactorMethods.ts", () => {
	describe("after a password", () => {
		it("SHOULD offer the TOTP once, the email code and the recovery codes WHEN the account has them all", () => {
			expect(
				listSecondFactorMethods({
					kind: FlowKindEnum.LOGIN,
					factorTypes: BOTH_FACTORS,
					remainingRecoveryCodes: 3,
				}),
			).toStrictEqual([
				SecondFactorMethodEnum.TOTP,
				SecondFactorMethodEnum.EMAIL,
				SecondFactorMethodEnum.RECOVERY_CODE,
			]);
		});

		it("SHOULD offer no recovery code WHEN every one is used", () => {
			expect(
				listSecondFactorMethods({
					kind: FlowKindEnum.LOGIN,
					factorTypes: [FactorTypeEnum.EMAIL],
					remainingRecoveryCodes: 0,
				}),
			).toStrictEqual([SecondFactorMethodEnum.EMAIL]);
		});
	});

	describe("after an email", () => {
		it.each([
			{ reason: "a mail login", kind: FlowKindEnum.MAIL_LOGIN },
			{ reason: "a password reset", kind: FlowKindEnum.PASSWORD_RESET },
		])("SHOULD never offer the email code WHEN it is $reason", ({ kind }) => {
			expect(
				listSecondFactorMethods({
					kind,
					factorTypes: BOTH_FACTORS,
					remainingRecoveryCodes: 10,
				}),
			).toStrictEqual([
				SecondFactorMethodEnum.TOTP,
				SecondFactorMethodEnum.RECOVERY_CODE,
			]);
		});
	});
});
