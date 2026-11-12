import { describe, expect, it } from "vitest";

import { buildIgdbGameUrl } from "./buildIgdbGameUrl.ts";

describe("buildIgdbGameUrl.ts", () => {
	describe("building the url of a game page", () => {
		it("SHOULD put a slug after the games segment WHEN given a slug", () => {
			expect(buildIgdbGameUrl("ico")).toBe(buildIgdbGameUrl("ico"));
		});

		it("SHOULD put an id after the games segment WHEN given a number", () => {
			expect(buildIgdbGameUrl(100)).toBe(buildIgdbGameUrl("100"));
		});
	});
});
