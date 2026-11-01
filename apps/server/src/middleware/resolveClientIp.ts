// Préfixe d'une IPv4 vue par un serveur qui écoute en IPv6 (::ffff:192.168.1.10)
const IPV4_MAPPED_PREFIX = "::ffff:";
const UNKNOWN_IP = "unknown";

/**
 * L'IP du visiteur : l'en-tête X-Real-IP que Caddy écrase avec l'IP qu'il a validée (Caddyfile, `real_ip`).
 * Sans en-tête (dev derrière Vite, tests), l'adresse de la connexion
 */
export function resolveClientIp(
	realIpHeader: string | undefined,
	socketAddress: string | undefined,
): string {
	const trimmedHeader = realIpHeader?.trim() ?? "";
	const ip =
		trimmedHeader === "" ? (socketAddress ?? UNKNOWN_IP) : trimmedHeader;
	return ip.startsWith(IPV4_MAPPED_PREFIX)
		? ip.slice(IPV4_MAPPED_PREFIX.length)
		: ip;
}
