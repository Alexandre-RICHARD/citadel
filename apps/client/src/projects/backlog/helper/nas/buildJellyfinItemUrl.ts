/**
 * La page d'un élément dans l'interface web de Jellyfin, d'où « Lire » démarre la lecture (§5) : sur le nom d'hôte par
 * lequel la page a été ouverte (IP du NAS en LAN, nom Tailscale sinon), au port de Jellyfin
 */
export function buildJellyfinItemUrl(
	hostname: string,
	port: number,
	serverId: string | null,
	itemId: string,
): string {
	const server =
		serverId === null ? "" : `&serverId=${encodeURIComponent(serverId)}`;
	return `http://${hostname}:${port}/web/#/details?id=${encodeURIComponent(itemId)}${server}`;
}
