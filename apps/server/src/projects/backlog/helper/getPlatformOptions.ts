import type { PlatformBean } from "../bean/platformBean.type.ts";

// Plateformes proposées pour une version jouée : celles de la version, puis leurs sous-plateformes (émulateurs, launchers)
export function getPlatformOptions(
	versionPlatforms: PlatformBean[],
	subPlatforms: PlatformBean[],
): PlatformBean[] {
	const parentIds = new Set(versionPlatforms.map(({ id }) => id));
	return [
		...versionPlatforms,
		...subPlatforms.filter(
			({ parentPlatformId }) =>
				parentPlatformId !== null && parentIds.has(parentPlatformId),
		),
	];
}
