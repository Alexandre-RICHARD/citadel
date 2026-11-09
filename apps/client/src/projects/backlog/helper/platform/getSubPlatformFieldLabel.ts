import { SubPlatformTypeEnum } from "@citadel/specs/src/projects/backlog/enum/subPlatformType.enum";

import type { PlatformFm } from "../../api/model/platformFm.type";

// Nom du second choix d'une plateforme : « Launcher » pour un PC, « Émulateur » pour une console, les deux sinon
export function getSubPlatformFieldLabel(subPlatforms: PlatformFm[]): string {
	const hasEmulator = subPlatforms.some(
		({ subPlatformType }) => subPlatformType === SubPlatformTypeEnum.EMULATOR,
	);
	const hasLauncher = subPlatforms.some(
		({ subPlatformType }) => subPlatformType === SubPlatformTypeEnum.LAUNCHER,
	);
	if (hasEmulator && hasLauncher) return "Émulateur ou launcher";
	return hasLauncher ? "Launcher" : "Émulateur";
}
