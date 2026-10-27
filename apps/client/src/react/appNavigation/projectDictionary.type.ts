import type { ThemeDefinitionType } from "@citadel/design-system/src/theme/themeDefinition.type";

import type { ProjectsEnum } from "./projects.enum";
import type { ProjectShowcase } from "./showcase/projectShowcase.type";

export type ProjectDictionary = {
	id: ProjectsEnum;
	path: string;
	name: string;
	documentTitle: string;
	favicon: string;
	illustration: string;
	// Le thème du projet, en clair et en sombre : le projet l'applique, la homepage en tire son ambiance
	theme: ThemeDefinitionType;
	// Sa présentation sur la homepage ; null pour la homepage elle-même
	showcase: ProjectShowcase | null;
};
