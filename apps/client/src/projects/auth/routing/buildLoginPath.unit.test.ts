import { describe, expect, it } from "vitest";

import { buildLoginPath } from "./buildLoginPath";

describe("buildLoginPath.ts", () => {
	describe("redirect", () => {
		it("SHOULD keep the requested page, its query and its fragment, encoded", () => {
			expect(buildLoginPath("/backlog?page=2#top")).toBe(
				"/auth/login?redirect=%2Fbacklog%3Fpage%3D2%23top",
			);
		});
	});
});
