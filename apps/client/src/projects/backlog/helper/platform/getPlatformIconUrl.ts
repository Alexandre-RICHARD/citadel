import { platformIconUrls } from "./platformIconUrls";

// L'adresse de l'icône d'une plateforme ou d'un launcher, retrouvée par son nom technique ; null tant que son SVG manque
export function getPlatformIconUrl(
	technicalName: string,
	iconUrls: Readonly<Record<string, string>> = platformIconUrls,
): string | null {
	return iconUrls[`../../icons/${technicalName}.svg`] ?? null;
}
