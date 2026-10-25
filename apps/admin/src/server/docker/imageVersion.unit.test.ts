import { describe, expect, it } from "vitest";

import { imageVersion } from "./imageVersion.ts";

describe("imageVersion.ts", () => {
	describe("tag", () => {
		it("SHOULD return the tag WHEN the image has one", () => {
			expect(imageVersion("lscr.io/linuxserver/radarr:6.1.1.10360-ls297")).toBe(
				"6.1.1.10360-ls297",
			);
		});

		it("SHOULD ignore a registry port WHEN the image has no tag", () => {
			expect(imageVersion("registry:5000/citadel-server")).toBe("latest");
		});

		it("SHOULD ignore the digest WHEN the image is pinned by both", () => {
			expect(imageVersion("alpine:3.24.3@sha256:abc")).toBe("3.24.3");
		});
	});
});
