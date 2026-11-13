import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";

// Les types de fin sans fin imposée : leurs jeux finis se lisent « Estimé fini », « Estimé complété »
const ESTIMATED_ENDING_TYPES: readonly EndingTypeEnum[] = [
	EndingTypeEnum.RUNS,
	EndingTypeEnum.SANDBOX,
	EndingTypeEnum.MULTIPLAYER,
];

export function isEstimatedEndingType(
	endingType: EndingTypeEnum | null,
): boolean {
	return endingType !== null && ESTIMATED_ENDING_TYPES.includes(endingType);
}
