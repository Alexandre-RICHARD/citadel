import { describe, expect, it } from "vitest";

import { parseSiteBanner } from "./parseSiteBanner";

describe("parseSiteBanner.ts", () => {
	describe("content", () => {
		it("SHOULD keep the banner WHEN the file is complete", () => {
			const banner = {
				id: "1",
				kind: "restore",
				message: "Restauré",
				endsAt: "2027-02-01T12:00:00+01:00",
			};
			expect(parseSiteBanner(banner)).toEqual(banner);
		});

		it("SHOULD treat an unknown kind as a message WHEN the file has one", () => {
			expect(
				parseSiteBanner({
					id: "1",
					kind: "autre",
					message: "Bonjour",
					endsAt: null,
				})?.kind,
			).toBe("message");
		});

		it("SHOULD return null WHEN the message is missing", () => {
			expect(
				parseSiteBanner({ id: "1", kind: "message", endsAt: null }),
			).toBeNull();
		});

		it("SHOULD return null WHEN the response is not an object", () => {
			expect(parseSiteBanner("<!doctype html>")).toBeNull();
		});
	});
});
