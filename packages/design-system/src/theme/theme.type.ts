// Chaque clé devient une variable CSS : colorText → var(--theme-colorText)
export type ThemeType = {
	// Fonds et surfaces
	colorBackground: string;
	colorSurface: string;
	colorSurfaceRaised: string;
	colorSurfaceSunken: string;
	colorOverlay: string;
	// Bordures
	colorBorder: string;
	colorBorderSoft: string;
	// Textes
	colorText: string;
	colorTextMuted: string;
	colorTextSubtle: string;
	// Intentions : Hue = teinte de base, Strong = version renforcée, Subtle = fond discret, Content = texte posé sur Hue
	colorPrimaryHue: string;
	colorPrimaryStrong: string;
	colorPrimarySubtle: string;
	colorPrimaryContent: string;
	colorSecondaryHue: string;
	colorSecondaryStrong: string;
	colorSecondarySubtle: string;
	colorSecondaryContent: string;
	colorAccentHue: string;
	colorAccentStrong: string;
	colorAccentSubtle: string;
	colorAccentContent: string;
	colorDestructiveHue: string;
	colorDestructiveStrong: string;
	colorDestructiveSubtle: string;
	colorDestructiveContent: string;
	colorConstructiveHue: string;
	colorConstructiveStrong: string;
	colorConstructiveSubtle: string;
	colorConstructiveContent: string;
	// Décoration : les couleurs d'identité, pour les illustrations et les fonds animés
	colorDecoration1: string;
	colorDecoration2: string;
	colorDecoration3: string;
	colorDecoration4: string;
	// Polices : Primary pour le texte courant, Secondary pour les titres, Mono pour les chiffres et le code
	fontFamilyPrimary: string;
	fontFamilySecondary: string;
	fontFamilyMono: string;
	// Titres : graisse, approche et casse
	fontWeightDisplay: string;
	letterSpacingDisplay: string;
	textTransformDisplay: string;
	// Tailles de police
	fontSizeXXS: string;
	fontSizeXS: string;
	fontSizeS: string;
	fontSizeM: string;
	fontSizeL: string;
	fontSizeXL: string;
	// Espacements
	spaceXXS: string;
	spaceXS: string;
	spaceS: string;
	spaceM: string;
	spaceL: string;
	spaceXL: string;
	spaceXXL: string;
	// Arrondis
	radiusS: string;
	radiusM: string;
	radiusL: string;
	radiusFull: string;
	// Coins coupés en biseau : 0 pour des coins droits
	cornerCut: string;
};
