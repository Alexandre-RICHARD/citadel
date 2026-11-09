import { SubPlatformTypeEnum } from "@citadel/specs/src/projects/backlog/enum/subPlatformType.enum";

// Ce qu'est une sous-plateforme, en info-bulle et dans la liste des plateformes
export const subPlatformTypeLabels: Readonly<
	Record<SubPlatformTypeEnum, string>
> = {
	[SubPlatformTypeEnum.EMULATOR]: "Émulateur",
	[SubPlatformTypeEnum.LAUNCHER]: "Launcher",
};
