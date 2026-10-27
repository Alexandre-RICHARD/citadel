import { useColorScheme } from "@citadel/design-system/src/theme/colorScheme/useColorScheme";

import type { ProjectsEnum } from "../appNavigation/projects.enum";
import { getColorSchemeStorageKey } from "./getColorSchemeStorageKey";

// Thème clair ou sombre d'un projet : la préférence du système, sauf choix contraire dans le projet.
// Le bouton qui bascule le thème l'appelle où il veut : ProjectThemeProvider suit
export function useProjectColorScheme(project: ProjectsEnum) {
	return useColorScheme(getColorSchemeStorageKey(project));
}
