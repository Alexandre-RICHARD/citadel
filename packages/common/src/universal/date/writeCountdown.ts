type AcceptedFormat = "HMS" | "HHMMSS";

// Un temps négatif (échéance dépassée) s'affiche à zéro ; un temps infini ou NaN (vitesse nulle…) donne une chaîne vide
export function writeCountdown(
	timeInMilliseconds: number,
	format: AcceptedFormat,
): string {
	const secondsInMiliseconds = 1000;
	const minutesInMiliseconds = secondsInMiliseconds * 60;
	const hoursInMiliseconds = minutesInMiliseconds * 60;

	if (!Number.isFinite(timeInMilliseconds)) return "";

	if (["HMS", "HHMMSS"].some((f) => f === format)) {
		const remainingTime = Math.max(timeInMilliseconds, 0);
		const h = Math.trunc(remainingTime / hoursInMiliseconds);
		const m = Math.trunc(
			(remainingTime % hoursInMiliseconds) / minutesInMiliseconds,
		);
		const s = Math.trunc(
			(remainingTime % minutesInMiliseconds) / secondsInMiliseconds,
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
