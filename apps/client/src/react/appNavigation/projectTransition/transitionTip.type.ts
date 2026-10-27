import type { ThemeType } from "@citadel/design-system/src/theme/theme.type";

// L'astuce affichée quand le chargement du projet traîne, dans le thème du projet
export type TransitionTip = {
	title: string;
	text: string;
	theme: ThemeType;
};
