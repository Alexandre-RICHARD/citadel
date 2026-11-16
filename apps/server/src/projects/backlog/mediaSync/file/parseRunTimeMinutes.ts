// « 1:52:03 » ou « 52:03 » (format de Radarr et Sonarr), en minutes ; null si illisible
export function parseRunTimeMinutes(
	runTime: string | null | undefined,
): number | null {
	if (runTime === null || runTime === undefined || runTime.trim() === "")
		return null;
	const parts = runTime.split(":").map(Number);
	if (
		parts.length < 2 ||
		parts.length > 3 ||
		parts.some((part) => !Number.isFinite(part))
	)
		return null;
	const [hours, minutes, seconds] = parts.length === 3 ? parts : [0, ...parts];
	return hours * 60 + minutes + seconds / 60;
}
