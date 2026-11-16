import { describe, expect, it } from "vitest";

import { buildJellyfinItemUrl } from "./buildJellyfinItemUrl";

describe("buildJellyfinItemUrl.ts", () => {
	describe("item page", () => {
		it("SHOULD open the item on the host the page came from, at the Jellyfin port", () => {
			expect(buildJellyfinItemUrl("nas", 8096, "server-1", "abc")).toBe(
				"http://nas:8096/web/#/details?id=abc&serverId=server-1",
			);
		});

		it("SHOULD leave the server out WHEN the survey does not know it", () => {
			expect(buildJellyfinItemUrl("192.168.1.2", 8096, null, "abc")).toBe(
				"http://192.168.1.2:8096/web/#/details?id=abc",
			);
		});
	});
});
