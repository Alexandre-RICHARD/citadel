import { NasToolEnum } from "@citadel/specs/src/projects/backlog/enum/nasTool.enum";

export const nasToolLabels: Readonly<Record<NasToolEnum, string>> = {
	[NasToolEnum.RADARR]: "Radarr",
	[NasToolEnum.SONARR]: "Sonarr",
};
