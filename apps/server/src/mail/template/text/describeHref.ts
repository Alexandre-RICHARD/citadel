// Un lien tel qu'un texte brut l'écrit : l'adresse seule pour un mailto, sans son objet ; l'URL sinon
export function describeHref(href: string): string {
	const url = new URL(href);
	return url.protocol === "mailto:" ? decodeURIComponent(url.pathname) : href;
}
