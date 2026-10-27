import type { ThemeDefinitionType } from "@citadel/design-system/src/theme/themeDefinition.type";

import type { ProjectsEnum } from "./projects.enum";

export type ProjectDictionary = {
	id: ProjectsEnum;
	path: string;
	name: string;
	description: string;
	documentTitle: string;
	favicon: string;
	illustration: string;
	// Le thème du projet, en clair et en sombre : le projet l'applique, la homepage en tire son ambiance
	theme: ThemeDefinitionType;
};
