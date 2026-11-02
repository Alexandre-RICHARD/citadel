const IPV4_BITS = 32;
const IPV6_BITS = 128;
const IPV6_GROUPS = 8;
const GROUP_BITS = 16;
const IPV4_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const IPV6_GROUP_PATTERN = /^[0-9a-f]{1,4}$/;

type Prefixes = {
	ipv4PrefixLength: number;
	ipv6PrefixLength: number;
};

function parseIpv4(ip: string): number[] | null {
	const bytes = IPV4_PATTERN.exec(ip)?.slice(1).map(Number);
	if (bytes === undefined || bytes.some((byte) => byte > 255)) return null;
	return bytes;
}

// Une IPv4 en fin d'IPv6 (64:ff9b::192.0.2.1) devient ses deux groupes de 16 bits
function expandEmbeddedIpv4(groups: string[]): string[] | null {
	const last = groups.at(-1);
	if (!last?.includes(".")) return groups;
	const bytes = parseIpv4(last);
	if (bytes === null) return null;
	const [a = 0, b = 0, c = 0, d = 0] = bytes;
	return [
		...groups.slice(0, -1),
		((a << 8) | b).toString(16),
		((c << 8) | d).toString(16),
	];
}

function splitGroups(text: string): string[] {
	return text === "" ? [] : text.split(":");
}

// Les 8 groupes d'une IPv6, « :: » déplié ; null si l'adresse est illisible
function parseIpv6(ip: string): number[] | null {
	const [address = ""] = ip.toLowerCase().split("%");
	const halves = address.split("::");
	if (halves.length > 2) return null;

	const head = expandEmbeddedIpv4(splitGroups(halves[0] ?? ""));
	const tail = expandEmbeddedIpv4(splitGroups(halves[1] ?? ""));
	if (head === null || tail === null) return null;

	const missingCount = IPV6_GROUPS - head.length - tail.length;
	if (halves.length === 1 ? missingCount !== 0 : missingCount < 1) return null;
	const groups = [...head, ...Array<string>(missingCount).fill("0"), ...tail];
	if (!groups.every((group) => IPV6_GROUP_PATTERN.test(group))) return null;
	return groups.map((group) => Number.parseInt(group, 16));
}

// Garde les `prefixLength` premiers bits de valeurs de `unitBits` bits chacune, met les autres à zéro
function keepPrefix(units: number[], unitBits: number, prefixLength: number) {
	return units.map((unit, index) => {
		const keptBits = Math.min(
			Math.max(prefixLength - index * unitBits, 0),
			unitBits,
		);
		const mask =
			keptBits === 0
				? 0
				: (0xffff << (unitBits - keptBits)) & ((1 << unitBits) - 1);
		return unit & mask;
	});
}

// RFC 5952 : la plus longue suite d'au moins deux groupes nuls devient « :: »
function formatIpv6(groups: number[]): string {
	let bestStart = -1;
	let bestLength = 1;
	for (let start = 0; start < groups.length; start++) {
		let length = 0;
		while (groups[start + length] === 0) length++;
		if (length > bestLength) {
			bestStart = start;
			bestLength = length;
		}
	}
	const hex = groups.map((group) => group.toString(16));
	if (bestStart === -1) return hex.join(":");
	const head = hex.slice(0, bestStart).join(":");
	const tail = hex.slice(bestStart + bestLength).join(":");
	return `${head}::${tail}`;
}

// Une IPv4 écrite en IPv6 (::ffff:203.0.113.5, en majuscules ou non) : ses 4 octets, à masquer comme une IPv4
function readMappedIpv4(groups: number[]): number[] | null {
	const [high = 0, low = 0] = groups.slice(6);
	const isMapped =
		groups.slice(0, 5).every((group) => group === 0) && groups[5] === 0xffff;
	return isMapped ? [high >> 8, high & 0xff, low >> 8, low & 0xff] : null;
}

function withPrefix(address: string, prefixLength: number, fullLength: number) {
	return prefixLength >= fullLength ? address : `${address}/${prefixLength}`;
}

/**
 * Le réseau d'une IP : ses `prefixLength` premiers bits, le reste à zéro, suivi de « /longueur » quand l'IP est
 * tronquée (203.0.113.0/24, 2001:db8:1:2::/64). Une valeur qui n'est pas une IP (« unknown ») revient telle quelle
 */
export function maskIpAddress(
	ip: string,
	{ ipv4PrefixLength, ipv6PrefixLength }: Prefixes,
): string {
	const ipv6 = parseIpv6(ip);
	const ipv4 = parseIpv4(ip) ?? (ipv6 === null ? null : readMappedIpv4(ipv6));
	if (ipv4 !== null)
		return withPrefix(
			keepPrefix(ipv4, 8, ipv4PrefixLength).join("."),
			ipv4PrefixLength,
			IPV4_BITS,
		);

	if (ipv6 !== null)
		return withPrefix(
			formatIpv6(keepPrefix(ipv6, GROUP_BITS, ipv6PrefixLength)),
			ipv6PrefixLength,
			IPV6_BITS,
		);

	return ip;
}
