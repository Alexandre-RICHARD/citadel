import type { ThemeType } from "./theme.type";

// Les jetons de couleur du thème (colorText, colorDecoration1…) : ceux qui changent entre clair et sombre
export type ThemeColorsType = {
	[
		TokenName in keyof ThemeType as TokenName extends `color${string}`
			? TokenName
			: never
	]: string;
};
