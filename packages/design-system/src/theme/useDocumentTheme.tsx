import { useLayoutEffect } from "react";

import type { ColorSchemeEnum } from "./colorScheme/colorScheme.enum";
import type { ThemeType } from "./theme.type";
import { themeToCssVariables } from "./themeToCssVariables";

// Pose le thème sur <html>, le temps du montage : les éléments rendus hors de l'arbre React (portails) le reçoivent,
// le fond suit jusque dans les débordements du défilement, et data-color-scheme permet aux styles d'un projet
// de distinguer clair et sombre. Avant l'affichage, pour éviter un éclair du mauvais thème
export function useDocumentTheme(
	theme: ThemeType,
	colorScheme: ColorSchemeEnum,
): void {
	useLayoutEffect(() => {
		const root = document.documentElement;
		const cssVariables = Object.entries(themeToCssVariables(theme));

		cssVariables.forEach(([name, value]) =>
			root.style.setProperty(name, value),
		);
		root.style.colorScheme = colorScheme;
		root.dataset.colorScheme = colorScheme;

		return () => {
			cssVariables.forEach(([name]) => root.style.removeProperty(name));
			root.style.removeProperty("color-scheme");
			delete root.dataset.colorScheme;
		};
	}, [theme, colorScheme]);
}
