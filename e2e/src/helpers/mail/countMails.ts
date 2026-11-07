import { listMailsTo } from "./listMailsTo.ts";

/** Combien de mails `address` a déjà reçus (pour `waitForMail` après un renvoi) */
export async function countMails(address: string): Promise<number> {
	return (await listMailsTo(address)).length;
}
