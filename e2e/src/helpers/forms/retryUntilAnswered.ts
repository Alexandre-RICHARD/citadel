import { expect } from "@playwright/test";

const RETRY_TIMEOUT_MS = 30_000;

/**
 * Après un échec (mauvais mot de passe, mauvais code), le serveur impose un court délai avant l'essai suivant : un essai
 * trop rapide n'est pas jugé, il est renvoyé en attente (bouton « Patiente… ») sans autre message. `attempt` remplit le
 * formulaire, l'envoie et vérifie la réponse avec `{ timeout: ANSWER_TIMEOUT_MS }` ; sans réponse, il est repris jusqu'à
 * ce que le délai soit passé
 */
export async function retryUntilAnswered(
	attempt: () => Promise<void>,
): Promise<void> {
	await expect(attempt).toPass({ timeout: RETRY_TIMEOUT_MS, intervals: [100] });
}
