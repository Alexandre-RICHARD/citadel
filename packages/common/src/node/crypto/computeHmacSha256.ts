import { createHmac } from "node:crypto";

// L'empreinte d'une valeur courte (un code à 6 chiffres), avec une clé secrète : sans la clé, la base ne permet pas de
// retrouver le code en essayant le million de possibilités. 32 octets
export function computeHmacSha256(key: string, value: string): Buffer {
	return createHmac("sha256", key).update(value, "utf8").digest();
}
