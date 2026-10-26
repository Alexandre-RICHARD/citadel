import { useQueryClient } from "@tanstack/react-query";

import { findCachedUserGame } from "../cache/findCachedUserGame";

type VersionPlatform = { versionId: number; platformId: number };

/**
 * Couples version + plateforme déjà joués d'un jeu du backlog, lus dans le tableau en cache : ils ne se proposent plus
 * pour une nouvelle version jouée. Le serveur refuse de toute façon un doublon
 */
export function useTakenVersionPlatforms(gameId: number): VersionPlatform[] {
	const queryClient = useQueryClient();
	return (findCachedUserGame(queryClient, gameId)?.userVersions ?? []).map(
		({ version, platform }) => ({
			versionId: version.id,
			platformId: platform.id,
		}),
	);
}
