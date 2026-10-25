import { describe, expect, it } from "vitest";

import { parseJellyfinSessions } from "./parseJellyfinSessions.ts";

describe("parseJellyfinSessions.ts", () => {
	describe("playbacks", () => {
		it("SHOULD describe the episode, device and progress WHEN a session is playing", () => {
			const activity = parseJellyfinSessions([
				{
					UserName: "alex",
					Client: "Jellyfin Android",
					DeviceName: "Pixel 8",
					NowPlayingItem: {
						Name: "Pilote",
						SeriesName: "Severance",
						RunTimeTicks: 30_000_000_000,
					},
					PlayState: {
						PositionTicks: 7_500_000_000,
						IsPaused: false,
						PlayMethod: "Transcode",
					},
				},
			]);

			expect(activity).toEqual({
				available: true,
				playbacks: [
					{
						user: "alex",
						device: "Pixel 8 · Jellyfin Android",
						title: "Severance — Pilote",
						paused: false,
						transcoding: true,
						progress: 0.25,
					},
				],
				activeSessionCount: 1,
			});
		});

		it("SHOULD count idle sessions without listing them WHEN nothing is playing", () => {
			const activity = parseJellyfinSessions([
				{ UserName: "alex", Client: "Jellyfin Web" },
			]);

			expect(activity).toMatchObject({ playbacks: [], activeSessionCount: 1 });
		});
	});
});
