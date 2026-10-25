import type { JellyfinActivity } from "../../shared/jellyfinActivity.type.ts";
import type { JellyfinPlayback } from "../../shared/jellyfinPlayback.type.ts";
import type { JellyfinSession } from "./jellyfinSession.type.ts";

function toPlayback(session: JellyfinSession): JellyfinPlayback | null {
	const item = session.NowPlayingItem;
	if (!item) return null;
	const state = session.PlayState ?? {};
	const runTime = item.RunTimeTicks ?? 0;
	return {
		user: session.UserName ?? "?",
		device: [session.DeviceName, session.Client].filter(Boolean).join(" · "),
		title: [item.SeriesName, item.Name].filter(Boolean).join(" — "),
		paused: state.IsPaused ?? false,
		transcoding: state.PlayMethod === "Transcode",
		progress:
			runTime > 0 ? Math.min(1, (state.PositionTicks ?? 0) / runTime) : null,
	};
}

export function parseJellyfinSessions(
	sessions: JellyfinSession[],
): JellyfinActivity {
	return {
		available: true,
		playbacks: sessions.map(toPlayback).filter((playback) => playback !== null),
		activeSessionCount: sessions.length,
	};
}
