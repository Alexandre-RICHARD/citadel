import { describe, expect, it } from "vitest";

import { toTmdbRuntime } from "./toTmdbRuntime.ts";

describe("toTmdbRuntime.ts", () => {
	describe("known runtime", () => {
		it("SHOULD keep the minutes WHEN TMDB gives a positive runtime", () => {
			expect(toTmdbRuntime(142)).toBe(142);
		});
	});

	describe("unknown runtime", () => {
		it.each([0, null, undefined])(
			"SHOULD give null WHEN TMDB gives %s",
			(runtime) => {
				expect(toTmdbRuntime(runtime)).toBeNull();
			},
		);
	});
});
