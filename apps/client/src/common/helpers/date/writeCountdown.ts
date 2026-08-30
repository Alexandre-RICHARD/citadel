type AcceptedFormat = "HMS" | "HHMMSS";

export function writeCountdown(
	timeInMilliseconds: number,
	format: AcceptedFormat,
): string {
	const secondsInMiliseconds = 1000;
	const minutesInMiliseconds = secondsInMiliseconds * 60;
	const hoursInMiliseconds = minutesInMiliseconds * 60;

	if (["HMS", "HHMMSS"].some((f) => f === format)) {
		const h = Math.trunc(timeInMilliseconds / hoursInMiliseconds);
		const m = Math.trunc(
			(timeInMilliseconds % hoursInMiliseconds) / minutesInMiliseconds,
		);
		const s = Math.trunc(
			(timeInMilliseconds % minutesInMiliseconds) / secondsInMiliseconds,
		);

		if (format === "HHMMSS") {
			const hh = h.toString().padStart(2, "0");
			const mm = m.toString().padStart(2, "0");
			const ss = s.toString().padStart(2, "0");

			return `${hh}H ${mm}M ${ss}S`;
		}

		return `${h}H ${m}M ${s}S`;
	}

	return "";
}
