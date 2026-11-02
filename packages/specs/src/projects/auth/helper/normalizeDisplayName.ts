// Le pseudo affiché tel qu'il est gardé : une seule forme par caractère (NFC, « é » tapé en deux touches comme en une),
// sans espace au début ni à la fin, et un seul espace entre deux mots
export function normalizeDisplayName(displayName: string): string {
	return displayName.normalize("NFC").trim().replace(/\s+/gu, " ");
}
