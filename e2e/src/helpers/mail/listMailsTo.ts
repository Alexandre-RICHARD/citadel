import { fetchMailpit } from "./fetchMailpit.ts";
import type { MailpitSummary } from "./mailpitSummary.type.ts";

/** Les emails reçus par `address`, le plus récent d'abord */
export async function listMailsTo(address: string): Promise<MailpitSummary[]> {
	const query = encodeURIComponent(`to:${address}`);
	const { messages } = await fetchMailpit<{ messages: MailpitSummary[] }>(
		`/search?query=${query}`,
	);
	// Mailpit les trie déjà ; on ne s'y fie pas
	return [...messages].sort((a, b) => b.Created.localeCompare(a.Created));
}
