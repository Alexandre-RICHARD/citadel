import { bytesToGb } from "@citadel/specs/src/projects/backlog/helper/nas/bytesToGb";

const formatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

// Une taille en Go, à une décimale (« 4,2 Go ») ; en To au-delà de 1 000 Go
export function formatSizeGb(sizeBytes: number): string {
	const gb = bytesToGb(sizeBytes);
	return gb >= 1000
		? `${formatter.format(gb / 1000)} To`
		: `${formatter.format(gb)} Go`;
}
