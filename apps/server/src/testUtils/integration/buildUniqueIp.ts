let lastIpSuffix = 0;

// Chaque test vient de son propre réseau /64 (les limites comptent un /64 comme une seule IP) : les limites par IP ne
// dépendent pas de l'ordre des tests
export function buildUniqueIp(): string {
	lastIpSuffix += 1;
	return `2001:db8:1:${lastIpSuffix.toString(16)}::1`;
}
