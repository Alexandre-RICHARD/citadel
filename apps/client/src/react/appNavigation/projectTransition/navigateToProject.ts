import { ColorSchemeEnum } from "@citadel/design-system/src/theme/colorScheme/colorScheme.enum";
import { readColorScheme } from "@citadel/design-system/src/theme/colorScheme/readColorScheme";
import { resolveTheme } from "@citadel/design-system/src/theme/resolveTheme";

import { getColorSchemeStorageKey } from "../../projectTheme/getColorSchemeStorageKey";
import type { ProjectDictionary } from "../projectDictionary.type";
import { projectLoaders } from "../projectLoaders";
import { navigateWithTransition } from "./navigateWithTransition";
import { toTransitionPalette } from "./toTransitionPalette";
import { TransitionEffectEnum } from "./transitionEffect.enum";

type Options = {
	project: ProjectDictionary;
	// Le bouton cliqué : la transition part de lui
	originElement: Element;
	reducedMotion: boolean;
};

// Mène à un projet avec sa transition, dans ses couleurs et dans le mode où il s'ouvrira (son propre choix de thème)
export function navigateToProject({
	project,
	originElement,
	reducedMotion,
}: Options): Promise<void> {
	const colorScheme = readColorScheme(getColorSchemeStorageKey(project.id));
	const theme = resolveTheme(project.theme, colorScheme);
	const originRect = originElement.getBoundingClientRect();

	return navigateWithTransition({
		path: project.path,
		effect: project.showcase?.transitionEffect ?? TransitionEffectEnum.Hex,
		palette: toTransitionPalette(theme),
		isDark: colorScheme === ColorSchemeEnum.Dark,
		origin: {
			x: originRect.left + originRect.width / 2,
			y: originRect.top + originRect.height / 2,
		},
		load: projectLoaders[project.id],
		tip: project.showcase && {
			title: project.name,
			text: project.showcase.tip,
			theme,
		},
		reducedMotion,
	});
}
