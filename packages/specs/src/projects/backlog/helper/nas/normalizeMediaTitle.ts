/**
 * Un titre ramené à ce qui compte pour le comparer : sans accents, sans casse, sans ponctuation. « L'Âge de glace : la
 * dérive » et « l age de glace la derive » se comparent égaux. Sert à relier un dossier « Titre (année) » à un média
 */
export function normalizeMediaTitle(title: string): string {
	return title
		.normalize("NFD")
		.replaceAll(/\p{Diacritic}/gu, "")
		.toLowerCase()
		.replaceAll("&", " and ")
		.replaceAll(/[^\p{L}\p{N}]+/gu, " ")
		.trim();
}
