const BYTES_PER_GB = 1_000_000_000;

// Une taille en gigaoctets (10⁹ octets, comme l'affichent Radarr et Sonarr), pour l'affichage et le filtre « Taille »
export function bytesToGb(sizeBytes: number): number {
	return sizeBytes / BYTES_PER_GB;
}
