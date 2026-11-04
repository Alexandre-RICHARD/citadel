import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum";
import { describe, expect, it } from "vitest";

import { AuthPathEnum } from "./authPath.enum";
import { findCompletionPath } from "./findCompletionPath";

const REDIRECT = "/game-death-counter";

describe("findCompletionPath.ts", () => {
	describe("paths", () => {
		it.each([
			{ kind: FlowKindEnum.REGISTRATION, path: AuthPathEnum.SECURE_ACCOUNT },
			{ kind: FlowKindEnum.EMAIL_CHANGE, path: AuthPathEnum.PROFILE },
			{ kind: FlowKindEnum.EMAIL_FACTOR, path: AuthPathEnum.PROFILE },
			{ kind: FlowKindEnum.LOGIN, path: REDIRECT },
			{ kind: FlowKindEnum.MAIL_LOGIN, path: REDIRECT },
			{ kind: FlowKindEnum.PASSWORD_RESET, path: REDIRECT },
			{ kind: undefined, path: REDIRECT },
		])("SHOULD lead a finished $kind flow to $path", ({ kind, path }) => {
			expect(findCompletionPath(kind, REDIRECT)).toBe(path);
		});
	});
});
