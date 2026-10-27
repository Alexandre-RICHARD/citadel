import type { ColorSchemeEnum } from "./colorScheme/colorScheme.enum";
import type { ThemeType } from "./theme.type";
import type { ThemeColorsType } from "./themeColors.type";

// Le thème d'un projet, en clair et en sombre. Il se lit avec resolveTheme
export type ThemeDefinitionType = {
	// Feuille des polices du thème : Google Fonts pour l'instant, hébergée sur le site plus tard
	fontStylesheet: string;
	// Polices, titres et formes : communs aux deux modes
	shared: Partial<Omit<ThemeType, keyof ThemeColorsType>>;
	// Couleurs de chaque mode, par-dessus la base du design system (defaultTheme en clair, defaultDarkColors en sombre)
	colors: Record<ColorSchemeEnum, Partial<ThemeColorsType>>;
};
