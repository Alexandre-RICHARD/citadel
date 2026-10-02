import { afterEach, describe, expect, it, vi } from "vitest";

import { dateNow } from "./dateNow.ts";

describe("dateNow.ts", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	describe("current date", () => {
		it("SHOULD return the current date", () => {
			vi.useFakeTimers({ now: new Date("2019-03-22T12:00:00.000Z") });

			expect(dateNow()).toStrictEqual(new Date("2019-03-22T12:00:00.000Z"));
		});

		it("SHOULD return a new instance on each call", () => {
			expect(dateNow()).not.toBe(dateNow());
		});
	});
});
