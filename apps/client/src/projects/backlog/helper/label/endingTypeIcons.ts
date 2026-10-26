import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import { Blocks, BookOpen, type LucideIcon, Repeat, Users } from "lucide-react";

// Icône de chaque type de fin, dans le tableau et dans le choix du type de fin
export const endingTypeIcons: Readonly<Record<EndingTypeEnum, LucideIcon>> = {
	[EndingTypeEnum.STORY]: BookOpen,
	[EndingTypeEnum.RUNS]: Repeat,
	[EndingTypeEnum.SANDBOX]: Blocks,
	[EndingTypeEnum.MULTIPLAYER]: Users,
};
