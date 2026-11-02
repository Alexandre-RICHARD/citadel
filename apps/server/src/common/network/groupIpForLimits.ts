import { maskIpAddress } from "./maskIpAddress.ts";

// La clé d'une IP dans les limiteurs. Un abonné IPv6 reçoit tout un /64 de son opérateur : compter chaque adresse à part
// lui donnerait des milliards d'essais. Une IPv4 compte seule
export function groupIpForLimits(ip: string): string {
	return maskIpAddress(ip, { ipv4PrefixLength: 32, ipv6PrefixLength: 64 });
}
