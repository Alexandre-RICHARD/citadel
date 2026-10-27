import { ColorSchemeEnum } from "@citadel/design-system/src/theme/colorScheme/colorScheme.enum";
import { readColorScheme } from "@citadel/design-system/src/theme/colorScheme/readColorScheme";
import { resolveAmbianceTheme } from "@citadel/design-system/src/theme/resolveAmbianceTheme";

import { getColorSchemeStorageKey } from "../../projectTheme/getColorSchemeStorageKey";
import type { ProjectDictionary } from "../projectDictionary.type";
import { projectLoaders } from "../projectLoaders";
import { navigateWithTransition } from "./navigateWithTransition";
import { toTransitionPalette } from "./toTransitionPalette";
import { TransitionEffectEnum } from "./transitionEffect.enum";
import type { TransitionPoint } from "./transitionPoint.type";

type Options = {
	project: ProjectDictionary;
	fromProject: ProjectDictionary | undefined;
	origin: TransitionPoint;
	reducedMotion: boolean;
	navigate: () => void;
};

// Mène à un projet avec une transition, dans le mode où il s'ouvrira (son propre choix de thème). La transition est
// celle du projet présenté : celui où l'on va, ou, au retour vers la homepage qui n'en a pas, celui que l'on quitte
// (la homepage rouvre sa présentation, dans son ambiance)
export function navigateToProject({
	project,
	fromProject,
	origin,
	reducedMotion,
	navigate,
}: Options): Promise<void> {
	const featuredProject =
		!project.showcase && fromProject?.showcase ? fromProject : project;
	const colorScheme = readColorScheme(getColorSchemeStorageKey(project.id));
	const theme = resolveAmbianceTheme(featuredProject.theme, colorScheme);

	return navigateWithTransition({
		navigate,
		effect:
			featuredProject.showcase?.transitionEffect ?? TransitionEffectEnum.Hex,
		palette: toTransitionPalette(theme),
		isDark: colorScheme === ColorSchemeEnum.Dark,
		origin,
		load: projectLoaders[project.id],
		tip: project.showcase && {
			title: project.name,
			text: project.showcase.tip,
			theme,
		},
		reducedMotion,
	});
}
