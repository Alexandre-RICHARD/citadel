import { NasQualityEnum } from "@citadel/specs/src/projects/backlog/enum/nasQuality.enum";

export const nasQualityLabels: Readonly<Record<NasQualityEnum, string>> = {
	[NasQualityEnum.SD]: "SD",
	[NasQualityEnum.HD]: "HD",
	[NasQualityEnum.FHD]: "FHD",
	[NasQualityEnum.UHD]: "4K",
};
