// Un lien qui ouvre un nouveau mail à `email`, son objet déjà rempli
export function buildMailtoHref(email: string, subject: string): string {
	return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}`;
}
