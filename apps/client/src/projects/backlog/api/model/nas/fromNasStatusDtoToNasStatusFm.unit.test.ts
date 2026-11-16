import { describe, expect, it } from "vitest";

import { fromNasStatusDtoToNasStatusFm } from "./fromNasStatusDtoToNasStatusFm";

describe("fromNasStatusDtoToNasStatusFm.ts", () => {
	describe("unlocked", () => {
		it("SHOULD build the links on the host of the page", () => {
			expect(
				fromNasStatusDtoToNasStatusFm(
					{
						isAvailable: true,
						isUnlocked: true,
						surveyedAt: "2026-11-10T03:00:00.000+01:00",
						jellyfinServerId: "server-1",
						jellyfinPort: 8096,
						consolePort: 8100,
					},
					"nas",
				),
			).toStrictEqual({
				isAvailable: true,
				isUnlocked: true,
				surveyedAt: "2026-11-10T03:00:00.000+01:00",
				jellyfin: { hostname: "nas", port: 8096, serverId: "server-1" },
				consoleUrl: "http://nas:8100/media",
			});
		});
	});

	describe("closed", () => {
		it("SHOULD give no link WHEN the server does not give the ports", () => {
			expect(
				fromNasStatusDtoToNasStatusFm(
					{
						isAvailable: false,
						isUnlocked: false,
						surveyedAt: null,
						jellyfinServerId: null,
						jellyfinPort: null,
						consolePort: null,
					},
					"example.org",
				),
			).toMatchObject({ jellyfin: null, consoleUrl: null });
		});
	});
});
