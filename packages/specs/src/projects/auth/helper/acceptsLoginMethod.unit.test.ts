import { describe, expect, it } from "vitest";

import { LoginMethodEnum } from "../enum/loginMethod.enum.ts";
import { acceptsLoginMethod } from "./acceptsLoginMethod.ts";

describe("acceptsLoginMethod.ts", () => {
	describe("accepted methods", () => {
		it.each([
			{ loginMethods: LoginMethodEnum.BOTH, method: LoginMethodEnum.MAIL },
			{ loginMethods: LoginMethodEnum.BOTH, method: LoginMethodEnum.PASSWORD },
			{ loginMethods: LoginMethodEnum.MAIL, method: LoginMethodEnum.MAIL },
			{
				loginMethods: LoginMethodEnum.PASSWORD,
				method: LoginMethodEnum.PASSWORD,
			},
		] as const)(
			"SHOULD accept $method WHEN the account chose $loginMethods",
			({ loginMethods, method }) => {
				expect(acceptsLoginMethod(loginMethods, method)).toBe(true);
			},
		);
	});

	describe("closed methods", () => {
		it.each([
			{ loginMethods: LoginMethodEnum.MAIL, method: LoginMethodEnum.PASSWORD },
			{ loginMethods: LoginMethodEnum.PASSWORD, method: LoginMethodEnum.MAIL },
		] as const)(
			"SHOULD refuse $method WHEN the account chose $loginMethods",
			({ loginMethods, method }) => {
				expect(acceptsLoginMethod(loginMethods, method)).toBe(false);
			},
		);
	});
});
