// Les images de Citadel : publiées sur GHCR, ou construites sur place (pnpm prod:local).
// Elles suivent les versions de Citadel, que la carte de déploiement liste déjà.
export function isOwnImage(image: string): boolean {
	return (
		image.startsWith("ghcr.io/alexandre-richard/citadel-") ||
		image.startsWith("citadel-")
	);
}
