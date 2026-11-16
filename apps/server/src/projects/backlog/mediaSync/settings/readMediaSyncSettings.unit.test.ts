import { CrossSeedSearchEnum } from "@citadel/specs/src/projects/backlog/mediaSyncReport/crossSeedSearch.enum.ts";
import { describe, expect, it } from "vitest";

import { readMediaSyncSettings } from "./readMediaSyncSettings.ts";

const ENV = {
	MEDIA_DATA_DIR: "/data",
	MEDIA_STATE_DIR: "/media-state",
	CITADEL_STATE_DIR: "/citadel-state",
	RADARR_URL: "http://media-gluetun:7878/",
	RADARR_API_KEY: "radarr-key",
	SONARR_URL: "http://media-gluetun:8989",
	SONARR_API_KEY: "sonarr-key",
	JELLYFIN_URL: "http://media-jellyfin:8096",
	JELLYFIN_API_KEY: "jellyfin-key",
	QBITTORRENT_URL: "http://media-gluetun:8080",
	QBITTORRENT_USER: "user",
	QBITTORRENT_PASSWORD: "password",
	MEDIA_TRACKERS:
		'[{"name":"Tracker A","urls":["https://a.example/announce/key"]}]',
};

describe("readMediaSyncSettings.ts", () => {
	describe("valid environment", () => {
		it("SHOULD read the addresses without their final slash, and the trackers", () => {
			const settings = readMediaSyncSettings(ENV);
			expect(settings.radarr.url).toBe("http://media-gluetun:7878");
			expect(settings.trackers).toStrictEqual([
				{ name: "Tracker A", urls: ["https://a.example/announce/key"] },
			]);
			expect(settings.crossSeedSearch).toBe(CrossSeedSearchEnum.NOT_SCHEDULED);
		});
	});

	describe("invalid environment", () => {
		it("SHOULD name the missing variables without their values", () => {
			expect(() =>
				readMediaSyncSettings({
					...ENV,
					RADARR_API_KEY: undefined,
					MEDIA_TRACKERS: "{",
				}),
			).toThrow(
				"Invalid media-sync environment : RADARR_API_KEY, MEDIA_TRACKERS",
			);
		});
	});
});
