// Expire tous les cookies du document, sans passer par les helpers testés
export function clearAllCookies(): void {
	for (const cookie of document.cookie.split(";")) {
		const name = cookie.split("=")[0].trim();
		if (name) {
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
		}
	}
}
