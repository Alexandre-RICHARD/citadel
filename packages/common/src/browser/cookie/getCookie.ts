function decodeCookieValue(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

export function getCookie(name: string): string | undefined {
	// Découpage avant décodage : une valeur encodée peut contenir un « ; » une fois décodée
	const foundCookie = document.cookie
		.split(";")
		.map((cookie) => cookie.trim())
		.find((cookie) => cookie.startsWith(`${name}=`));

	if (foundCookie === undefined) return undefined;
	return decodeCookieValue(foundCookie.substring(name.length + 1));
}
