import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum";
import { describe, expect, it } from "vitest";

import { AuthPathEnum } from "./authPath.enum";
import { findFlowPagePath } from "./findFlowPagePath";

describe("findFlowPagePath.ts", () => {
	describe("pages", () => {
		it.each([
			{ kind: FlowKindEnum.REGISTRATION, path: AuthPathEnum.REGISTER },
			{ kind: FlowKindEnum.LOGIN, path: AuthPathEnum.LOGIN },
			{ kind: FlowKindEnum.MAIL_LOGIN, path: AuthPathEnum.LOGIN },
			{
				kind: FlowKindEnum.PASSWORD_RESET,
				path: AuthPathEnum.FORGOT_PASSWORD,
			},
		])("SHOULD continue a $kind flow on $path", ({ kind, path }) => {
			expect(findFlowPagePath(kind)).toBe(path);
		});
	});
});
