import { listMailsTo } from "./listMailsTo.ts";

/** Combien de mails d'objet `subject` `address` a déjà reçus (pour `waitForMailWithSubject` quand le même objet revient) */
export async function countMailsWithSubject(
	address: string,
	subject: string,
): Promise<number> {
	return (await listMailsTo(address)).filter((mail) => mail.Subject === subject)
		.length;
}
