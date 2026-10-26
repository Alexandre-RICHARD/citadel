import type { PlatformBean } from "../bean/platformBean.type.ts";

// Plateformes proposées pour une version jouée : celles de la version, puis les émulateurs de ces consoles
export function getPlatformOptions(
	versionPlatforms: PlatformBean[],
	emulators: PlatformBean[],
): PlatformBean[] {
	const consoleIds = new Set(versionPlatforms.map(({ id }) => id));
	return [
		...versionPlatforms,
		...emulators.filter(
			({ emulatedPlatformId }) =>
				emulatedPlatformId !== null && consoleIds.has(emulatedPlatformId),
		),
	];
}
