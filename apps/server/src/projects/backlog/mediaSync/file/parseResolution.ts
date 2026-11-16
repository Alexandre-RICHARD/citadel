// « 1920x1080 » (format de Radarr et Sonarr) ; null si illisible
export function parseResolution(
	resolution: string | null | undefined,
): { width: number; height: number } | null {
	const match = /(?<width>\d+)\s*x\s*(?<height>\d+)/iu.exec(resolution ?? "");
	if (match?.groups === undefined) return null;
	return {
		width: Number(match.groups.width),
		height: Number(match.groups.height),
	};
}
