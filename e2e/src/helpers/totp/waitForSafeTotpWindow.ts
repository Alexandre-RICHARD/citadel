const PERIOD_MS = 30_000;
// Marge en deçà de laquelle un changement de pas peut tomber entre le calcul d'un code et sa vérification
const SAFE_MARGIN_MS = 4_000;

/**
 * Attend, si besoin, le début du pas TOTP suivant : un test qui calcule plusieurs codes à la suite ne doit pas voir le
 * pas changer entre deux (les codes « précédent / actuel / suivant » seraient décalés)
 */
export async function waitForSafeTotpWindow(): Promise<void> {
	const remainingMs = PERIOD_MS - (Date.now() % PERIOD_MS);
	if (remainingMs > SAFE_MARGIN_MS) return;
	await new Promise((resolve) => setTimeout(resolve, remainingMs + 200));
}
