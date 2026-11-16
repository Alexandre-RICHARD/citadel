import { NasQualityEnum } from "@citadel/specs/src/projects/backlog/enum/nasQuality.enum.ts";

const ORDER = [
	NasQualityEnum.SD,
	NasQualityEnum.HD,
	NasQualityEnum.FHD,
	NasQualityEnum.UHD,
];

function fromHeight(height: number): NasQualityEnum {
	if (height >= 2160) return NasQualityEnum.UHD;
	if (height >= 1080) return NasQualityEnum.FHD;
	if (height >= 720) return NasQualityEnum.HD;
	return NasQualityEnum.SD;
}

function fromWidth(width: number): NasQualityEnum {
	if (width >= 3840) return NasQualityEnum.UHD;
	if (width >= 1920) return NasQualityEnum.FHD;
	if (width >= 1280) return NasQualityEnum.HD;
	return NasQualityEnum.SD;
}

/**
 * La qualité d'une image, d'après la meilleure des deux mesures (§5) : un film en 1920 × 800 (bandes noires coupées) est
 * FHD, un épisode en 1440 × 1080 (4:3) aussi
 */
export function qualityOfResolution(
	width: number,
	height: number,
): NasQualityEnum {
	const byHeight = fromHeight(height);
	const byWidth = fromWidth(width);
	return ORDER.indexOf(byHeight) >= ORDER.indexOf(byWidth) ? byHeight : byWidth;
}
