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
	// Polices
	fontFamilyPrimary: string;
	fontFamilySecondary: string;
	fontFamilyMono: string;
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
};
