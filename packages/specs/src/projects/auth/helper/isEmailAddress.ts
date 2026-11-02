import { z } from "zod";

// Lettres accentuées admises avant comme après l'arobase (RFC 6531) : josé@exemple.fr est une adresse
const unicodeEmailSchema = z.email({ pattern: z.regexes.unicodeEmail });

const DOMAIN_EXTENSION = /\.[^.]+$/u;

// Une adresse de messagerie, avec un domaine et son extension (alex@exemple, sans point, n'en est pas une)
export function isEmailAddress(value: string): boolean {
	const domain = value.slice(value.lastIndexOf("@") + 1);
	return (
		unicodeEmailSchema.safeParse(value).success && DOMAIN_EXTENSION.test(domain)
	);
}
