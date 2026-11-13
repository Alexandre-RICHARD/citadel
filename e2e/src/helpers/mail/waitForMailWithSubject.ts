import { expect } from "@playwright/test";

import { listMailsTo } from "./listMailsTo.ts";
import { readMail } from "./readMail.ts";
import type { ReceivedMail } from "./receivedMail.type.ts";

/**
 * Attend, parmi les emails reçus par `address`, le plus récent dont l'objet est `subject` (plusieurs emails peuvent partir à
 * la suite : un code, puis un avis de sécurité). `alreadyReceived` : combien d'emails de cet objet l'adresse a déjà
 * reçus (countMailsWithSubject), pour attendre un NOUVEAU email quand le même objet revient. Échoue avec un message
 * clair s'il n'arrive pas
 */
export async function waitForMailWithSubject(
	address: string,
	subject: string,
	{ alreadyReceived = 0 }: { alreadyReceived?: number } = {},
): Promise<ReceivedMail> {
	async function findMatching() {
		return (await listMailsTo(address)).filter(
			(mail) => mail.Subject === subject,
		);
	}

	await expect
		.poll(async () => (await findMatching()).length, {
			message: `Aucun email « ${subject} » reçu pour ${address} (voir http://localhost:8025)`,
			timeout: 15_000,
		})
		.toBeGreaterThan(alreadyReceived);

	const [latest] = await findMatching();
	if (latest === undefined) throw new Error("unreachable");
	return readMail(latest.ID);
}
