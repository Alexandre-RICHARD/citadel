import { describe, expect, it } from "vitest";

import { buildNasSettings } from "./buildNasSettings.ts";

const VARIABLES = {
	MEDIA_STATE_DIR: "/media-state",
	MEDIA_PASSWORD_HASH: "hash",
	MEDIA_OWNER_USER_ID: 7,
	MEDIA_UNLOCK_HOURS: 12,
	MEDIA_JELLYFIN_PORT: 8096,
	MEDIA_CONSOLE_PORT: 8100,
};

describe("buildNasSettings.ts", () => {
	describe("local instance", () => {
		it("SHOULD give the settings WHEN the media state folder is set", () => {
			expect(buildNasSettings(VARIABLES)).toStrictEqual({
				stateDir: "/media-state",
				passwordHash: "hash",
				ownerUserId: 7,
				unlockDurationMs: 12 * 60 * 60 * 1000,
				jellyfinPort: 8096,
				consolePort: 8100,
			});
		});
	});

	describe("public server", () => {
		it("SHOULD give nothing WHEN the media state folder is missing", () => {
			expect(
				buildNasSettings({ ...VARIABLES, MEDIA_STATE_DIR: undefined }),
			).toBeNull();
		});
	});
});
