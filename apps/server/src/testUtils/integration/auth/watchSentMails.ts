import { expect, vi } from "vitest";

import type { Mail } from "../../../mail/mail.type.ts";
import { memoryMailSender } from "../../../mail/sender/memoryMailSender.ts";

/**
 * À appeler avant la requête : les mails de l'authentification partent après la réponse, sans être attendus.
 * `waitFor(count)` attend que `count` mails soient partis depuis, et les renvoie ; `expectNone` vérifie qu'aucun n'est
 * parti, après avoir laissé aux envois en cours le temps de finir
 */
export function watchSentMails() {
	const sentBefore = memoryMailSender.sentMails.length;

	function sentSince(): Mail[] {
		return memoryMailSender.sentMails.slice(sentBefore);
	}

	async function waitFor(count: number): Promise<Mail[]> {
		await vi.waitFor(() => {
			expect(sentSince()).toHaveLength(count);
		});
		return sentSince();
	}

	return {
		waitFor,
		// Le seul mail parti depuis
		async waitForOne(): Promise<Mail> {
			const [mail] = await waitFor(1);
			if (mail === undefined) throw new Error("No mail sent");
			return mail;
		},
		async expectNone(): Promise<void> {
			await new Promise((resolve) => {
				setTimeout(resolve, 50);
			});
			expect(sentSince()).toStrictEqual([]);
		},
	};
}
