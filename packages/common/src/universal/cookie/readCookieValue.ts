function decodeCookieValue(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

// Un cookie d'un en-tête Cookie ou de document.cookie (« a=1; b=2 ») ; undefined s'il n'y est pas
export function readCookieValue(
	cookieHeader: string | undefined,
	name: string,
): string | undefined {
	// Découpage avant décodage : une valeur encodée peut contenir un « ; » une fois décodée
	for (const pair of (cookieHeader ?? "").split(";")) {
		const separatorIndex = pair.indexOf("=");
		if (separatorIndex !== -1 && pair.slice(0, separatorIndex).trim() === name)
			return decodeCookieValue(pair.slice(separatorIndex + 1).trim());
	}
	return undefined;
}
