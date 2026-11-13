import { listMailsTo } from "./listMailsTo.ts";

/** Combien d'emails `address` a déjà reçus (pour `waitForMail` après un renvoi) */
export async function countMails(address: string): Promise<number> {
	return (await listMailsTo(address)).length;
}
