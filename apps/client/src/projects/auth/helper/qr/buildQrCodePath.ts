/**
 * Le dessin d'un QR code en un seul tracé SVG : un carré de 1 sur 1 pour chaque module noir, dans un repère où un module
 * vaut 1. Le QR code se fait ainsi dans le navigateur, sans rien injecter dans la page : l'URI du secret ne part nulle
 * part
 */
export function buildQrCodePath(
	modules: readonly (readonly boolean[])[],
): string {
	return modules
		.flatMap((row, y) =>
			row.flatMap((isDark, x) => (isDark ? [`M${x} ${y}h1v1h-1z`] : [])),
		)
		.join("");
}
