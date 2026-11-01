// Le label citadel.auto-stop (« 3h », « 30m ») en secondes ; null s'il est illisible.
// Même lecture qu'infra-ops (job auto-stop).
const AUTO_STOP = /^(\d+)([hm])$/;

export function parseAutoStop(label: string): number | null {
	const match = AUTO_STOP.exec(label);
	if (!match) return null;
	return Number(match[1]) * (match[2] === "h" ? 3600 : 60);
}
