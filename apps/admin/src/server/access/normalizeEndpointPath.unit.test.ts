import { describe, expect, it } from "vitest";

import { normalizeEndpointPath } from "./normalizeEndpointPath.ts";

describe("normalizeEndpointPath.ts", () => {
	describe("query string", () => {
		it("SHOULD drop the query string", () => {
			expect(
				normalizeEndpointPath("/api/backlog/user-games?page=2&sort="),
			).toBe("/api/backlog/user-games");
		});
	});

	describe("varying segments", () => {
		it("SHOULD replace a number by :id", () => {
			expect(
				normalizeEndpointPath("/api/backlog/user-versions/325/done-dlcs/12"),
			).toBe("/api/backlog/user-versions/:id/done-dlcs/:id");
		});

		it("SHOULD replace a long opaque segment by :token", () => {
			expect(
				normalizeEndpointPath(
					"/api/auth/links/6Oq-r8E5dxmQ-hE4C44LQM7e2eN2JfKXsaXvD",
				),
			).toBe("/api/auth/links/:token");
		});
	});

	describe("fixed segments", () => {
		it("SHOULD keep words, including long ones with a hyphen", () => {
			expect(normalizeEndpointPath("/api/backlog/user-games")).toBe(
				"/api/backlog/user-games",
			);
		});
	});
});
