import { CrossSeedSearchEnum } from "@citadel/specs/src/projects/backlog/mediaSyncReport/crossSeedSearch.enum.ts";
import { z } from "zod";

import type { MediaSyncSettings } from "./mediaSyncSettings.type.ts";

const urlSchema = z.url().transform((url) => url.replace(/\/+$/, ""));
const secretSchema = z.string().min(1);

// MEDIA_TRACKERS (.env.prod) : [{"name":"…","urls":["…"]}], sur une ligne. Ses adresses ne sont jamais réécrites
const trackersSchema = z
	.string()
	.min(1)
	.transform((text, context) => {
		try {
			return JSON.parse(text) as unknown;
		} catch {
			context.addIssue({
				code: "custom",
				message: "MEDIA_TRACKERS is not JSON",
			});
			return z.NEVER;
		}
	})
	.pipe(
		z.array(
			z.object({ name: z.string().min(1), urls: z.array(z.url()).min(1) }),
		),
	);

const envSchema = z.object({
	MEDIA_DATA_DIR: z.string().min(1),
	MEDIA_STATE_DIR: z.string().min(1),
	CITADEL_STATE_DIR: z.string().min(1),
	RADARR_URL: urlSchema,
	RADARR_API_KEY: secretSchema,
	SONARR_URL: urlSchema,
	SONARR_API_KEY: secretSchema,
	JELLYFIN_URL: urlSchema,
	JELLYFIN_API_KEY: secretSchema,
	QBITTORRENT_URL: urlSchema,
	QBITTORRENT_USER: secretSchema,
	QBITTORRENT_PASSWORD: secretSchema,
	MEDIA_TRACKERS: trackersSchema,
	// Posée par infra-ops, qui vient de s'occuper de cross-seed (§8, étape 1)
	MEDIA_SYNC_CROSS_SEED_SEARCH: z
		.enum(CrossSeedSearchEnum)
		.default(CrossSeedSearchEnum.NOT_SCHEDULED),
});

/**
 * Les réglages du job media-sync, tirés de son environnement (compose.yml, service media-sync). Une variable manquante
 * arrête le job avant tout appel : son message ne cite que les noms des variables, jamais leurs valeurs
 */
export function readMediaSyncSettings(
	env: Record<string, string | undefined>,
): MediaSyncSettings {
	const parsed = envSchema.safeParse(env);
	if (!parsed.success)
		throw new Error(
			`Invalid media-sync environment : ${parsed.error.issues.map(({ path }) => path.join(".")).join(", ")}`,
		);
	const variables = parsed.data;
	return {
		dataDir: variables.MEDIA_DATA_DIR,
		mediaStateDir: variables.MEDIA_STATE_DIR,
		citadelStateDir: variables.CITADEL_STATE_DIR,
		radarr: { url: variables.RADARR_URL, apiKey: variables.RADARR_API_KEY },
		sonarr: { url: variables.SONARR_URL, apiKey: variables.SONARR_API_KEY },
		jellyfin: {
			url: variables.JELLYFIN_URL,
			apiKey: variables.JELLYFIN_API_KEY,
		},
		qbittorrent: {
			url: variables.QBITTORRENT_URL,
			user: variables.QBITTORRENT_USER,
			password: variables.QBITTORRENT_PASSWORD,
		},
		trackers: variables.MEDIA_TRACKERS,
		crossSeedSearch: variables.MEDIA_SYNC_CROSS_SEED_SEARCH,
	};
}
