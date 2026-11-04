import { LoginMethodEnum } from "@citadel/specs/src/projects/auth/enum/loginMethod.enum";
import { describe, expect, it } from "vitest";

import { fromMeDtoToMeFm } from "./fromMeDtoToMeFm";

const ME = {
	email: "alex@example.com",
	username: "Alex",
	loginMethods: LoginMethodEnum.BOTH,
};

describe("fromMeDtoToMeFm.ts", () => {
	describe("display name", () => {
		it("SHOULD keep the chosen display name WHEN there is one", () => {
			expect(
				fromMeDtoToMeFm({ ...ME, displayName: "Alex le Grand" }),
			).toMatchObject({
				displayName: "Alex le Grand",
				customDisplayName: "Alex le Grand",
			});
		});

		it("SHOULD show the username WHEN no display name is chosen", () => {
			expect(fromMeDtoToMeFm({ ...ME, displayName: null })).toStrictEqual({
				...ME,
				displayName: "Alex",
				customDisplayName: null,
			});
		});
	});
});
