// Un cookie de l'en-tête Cookie (« a=1; b=2 »), sans dépendance pour si peu
export function readCookie(
	cookieHeader: string | undefined,
	name: string,
): string | undefined {
	for (const pair of (cookieHeader ?? "").split(";")) {
		const separatorIndex = pair.indexOf("=");
		if (separatorIndex === -1) continue;
		if (pair.slice(0, separatorIndex).trim() === name)
			return decodeURIComponent(pair.slice(separatorIndex + 1).trim());
	}
	return undefined;
}
