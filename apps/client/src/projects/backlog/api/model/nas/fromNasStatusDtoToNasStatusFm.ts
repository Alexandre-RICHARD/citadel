import type { NasStatusDto } from "@citadel/specs/src/projects/backlog/dto/nas/nasStatusDto.type";

import type { NasStatusFm } from "./nasStatusFm.type";

/**
 * Les liens vers Jellyfin et la console reprennent le nom d'hôte par lequel la page a été ouverte (IP du NAS en LAN, nom
 * Tailscale sinon) : ils marchent dans les deux cas (§2)
 */
export function fromNasStatusDtoToNasStatusFm(
	status: NasStatusDto,
	hostname: string,
): NasStatusFm {
	return {
		isAvailable: status.isAvailable,
		isUnlocked: status.isUnlocked,
		surveyedAt: status.surveyedAt,
		jellyfin:
			status.jellyfinPort === null
				? null
				: {
						hostname,
						port: status.jellyfinPort,
						serverId: status.jellyfinServerId,
					},
		consoleUrl:
			status.consolePort === null
				? null
				: `http://${hostname}:${status.consolePort}/media`,
	};
}
