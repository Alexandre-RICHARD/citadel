import { describe, expect, it } from "vitest";

import { computeHotp } from "./computeHotp.ts";
import { findAcceptedTotpStep } from "./findAcceptedTotpStep.ts";

const RFC_SECRET = Buffer.from("12345678901234567890", "ascii");
const PERIOD_SECONDS = 30;
const NOW_MS = 1_111_111_111_000;
const CURRENT_STEP = 37_037_037;

function check(
	code: string,
	overrides: { lastUsedStep?: number | null; driftSteps?: number } = {},
) {
	return findAcceptedTotpStep({
		secret: RFC_SECRET,
		code,
		nowMs: NOW_MS,
		lastUsedStep: null,
		digits: 6,
		periodSeconds: PERIOD_SECONDS,
		driftSteps: 1,
		...overrides,
	});
}

function codeAt(step: number): string {
	return computeHotp(RFC_SECRET, step, 6);
}

describe("findAcceptedTotpStep.ts", () => {
	describe("RFC 6238 test vectors", () => {
		// Annexe B, SHA-1, 8 chiffres
		it.each([
			{ seconds: 59, expected: "94287082" },
			{ seconds: 1_111_111_109, expected: "07081804" },
			{ seconds: 1_111_111_111, expected: "14050471" },
			{ seconds: 1_234_567_890, expected: "89005924" },
			{ seconds: 2_000_000_000, expected: "69279037" },
			{ seconds: 20_000_000_000, expected: "65353130" },
		])(
			"SHOULD accept $expected WHEN it is $seconds seconds after 1970",
			({ seconds, expected }) => {
				expect(
					findAcceptedTotpStep({
						secret: RFC_SECRET,
						code: expected,
						nowMs: seconds * 1000,
						lastUsedStep: null,
						digits: 8,
						periodSeconds: PERIOD_SECONDS,
						driftSteps: 0,
					}),
				).toBe(Math.floor(seconds / PERIOD_SECONDS));
			},
		);
	});

	describe("clock drift", () => {
		it.each([
			{ reason: "the current step", step: CURRENT_STEP },
			{ reason: "the previous step", step: CURRENT_STEP - 1 },
			{ reason: "the next step", step: CURRENT_STEP + 1 },
		])("SHOULD accept the code of $reason", ({ step }) => {
			expect(check(codeAt(step))).toBe(step);
		});

		it.each([
			{ reason: "two steps before", step: CURRENT_STEP - 2 },
			{ reason: "two steps after", step: CURRENT_STEP + 2 },
		])("SHOULD refuse the code of $reason", ({ step }) => {
			expect(check(codeAt(step))).toBeNull();
		});

		it("SHOULD accept only the current step WHEN no drift is allowed", () => {
			expect(check(codeAt(CURRENT_STEP - 1), { driftSteps: 0 })).toBeNull();
		});
	});

	describe("replay", () => {
		it("SHOULD refuse a code WHEN its step was already used", () => {
			expect(
				check(codeAt(CURRENT_STEP), { lastUsedStep: CURRENT_STEP }),
			).toBeNull();
		});

		it("SHOULD refuse an older code WHEN a newer step was already used", () => {
			expect(
				check(codeAt(CURRENT_STEP - 1), { lastUsedStep: CURRENT_STEP }),
			).toBeNull();
		});

		it("SHOULD accept the next code WHEN the previous step was used", () => {
			expect(
				check(codeAt(CURRENT_STEP + 1), { lastUsedStep: CURRENT_STEP }),
			).toBe(CURRENT_STEP + 1);
		});
	});

	describe("rejected codes", () => {
		it.each([
			{ reason: "a wrong code", code: "000000" },
			{ reason: "a shorter code", code: codeAt(CURRENT_STEP).slice(1) },
			{ reason: "an empty code", code: "" },
		])("SHOULD refuse $reason", ({ code }) => {
			expect(check(code)).toBeNull();
		});
	});
});
