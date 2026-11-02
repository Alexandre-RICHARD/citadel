import { timingSafeEqual } from "node:crypto";

// Compare deux empreintes en temps constant : la durée de la réponse ne dit pas combien d'octets étaient justes.
// Des longueurs différentes ne se comparent pas (timingSafeEqual lèverait une erreur) : leur longueur n'est pas secrète
export function isEqualInConstantTime(left: Buffer, right: Buffer): boolean {
	return left.length === right.length && timingSafeEqual(left, right);
}
