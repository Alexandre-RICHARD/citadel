import { maskIpAddress } from "./maskIpAddress.ts";

// L'IP gardée en base (sessions, journal de sécurité) : son réseau suffit à reconnaître un lieu, sans désigner un abonné.
// /24 en IPv4, /48 en IPv6 (le bloc d'un site, plus large que le /64 d'un abonné)
export function truncateIpForStorage(ip: string): string {
	return maskIpAddress(ip, { ipv4PrefixLength: 24, ipv6PrefixLength: 48 });
}
