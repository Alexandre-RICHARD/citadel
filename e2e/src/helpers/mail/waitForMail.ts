import { expect } from "@playwright/test";

import { listMailsTo } from "./listMailsTo.ts";
import { readMail } from "./readMail.ts";
import type { ReceivedMail } from "./receivedMail.type.ts";

/**
 * Attend le dernier mail reçu par `address` (le mail part APRÈS la réponse du serveur : il peut
 * arriver quelques instants plus tard) et le lit. Échoue avec un message clair s'il n'arrive pas.
 * `afterCount` : nombre de mails déjà reçus par cette adresse, pour attendre un NOUVEAU mail (renvoi)
 */
export async function waitForMail(
	address: string,
	{ afterCount = 0 }: { afterCount?: number } = {},
): Promise<ReceivedMail> {
	await expect
		.poll(async () => (await listMailsTo(address)).length, {
			message: `Aucun mail reçu pour ${address} (voir http://localhost:8025)`,
			timeout: 15_000,
		})
		.toBeGreaterThan(afterCount);

	const [latest] = await listMailsTo(address);
	if (latest === undefined) throw new Error("unreachable");
	return readMail(latest.ID);
}
