import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import { describe, expect, it } from "vitest";

import { isDecoyFlow } from "./isDecoyFlow.ts";

const PAYLOAD = { username: "Alex", passwordHash: "argon2id:hash" };

describe("isDecoyFlow.ts", () => {
	describe("registrations", () => {
		it("SHOULD be a decoy WHEN no account waits in the flow", () => {
			expect(
				isDecoyFlow({
					kind: FlowKindEnum.REGISTRATION,
					userId: null,
					payload: null,
				}),
			).toBe(true);
		});

		it("SHOULD be a real flow WHEN an account waits in the flow", () => {
			expect(
				isDecoyFlow({
					kind: FlowKindEnum.REGISTRATION,
					userId: null,
					payload: PAYLOAD,
				}),
			).toBe(false);
		});
	});

	describe("other flows", () => {
		it.each([FlowKindEnum.MAIL_LOGIN, FlowKindEnum.PASSWORD_RESET])(
			"SHOULD be a decoy WHEN a %s flow has no account",
			(kind) => {
				expect(isDecoyFlow({ kind, userId: null, payload: null })).toBe(true);
			},
		);

		it("SHOULD be a real flow WHEN it has an account", () => {
			expect(
				isDecoyFlow({
					kind: FlowKindEnum.MAIL_LOGIN,
					userId: 7,
					payload: null,
				}),
			).toBe(false);
		});
	});
});
