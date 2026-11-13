import { expect } from "@playwright/test";

import { listMailsTo } from "./listMailsTo.ts";
import { readMail } from "./readMail.ts";
import type { ReceivedMail } from "./receivedMail.type.ts";

/**
 * Attend le dernier email reçu par `address` (l'email part APRÈS la réponse du serveur : il peut
 * arriver quelques instants plus tard) et le lit. Échoue avec un message clair s'il n'arrive pas.
 * `afterCount` : nombre d'emails déjà reçus par cette adresse, pour attendre un NOUVEAU email (renvoi)
 */
export async function waitForMail(
	address: string,
	{ afterCount = 0 }: { afterCount?: number } = {},
): Promise<ReceivedMail> {
	await expect
		.poll(async () => (await listMailsTo(address)).length, {
			message: `Aucun email reçu pour ${address} (voir http://localhost:8025)`,
			timeout: 15_000,
		})
		.toBeGreaterThan(afterCount);

	const [latest] = await listMailsTo(address);
	if (latest === undefined) throw new Error("unreachable");
	return readMail(latest.ID);
}
