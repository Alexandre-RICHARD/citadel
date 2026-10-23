import { useEffect, useState } from "react";

/** Heure courante (ms depuis l'epoch), rafraîchie à intervalle régulier ; figée si intervalMs est null */
export function useNow(intervalMs: number | null): number {
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (intervalMs === null) {
			return undefined;
		}
		function tick(): void {
			setNow(Date.now());
		}
		// Remise à l'heure immédiate : l'heure a pu rester figée longtemps
		const timeoutId = setTimeout(tick, 0);
		const intervalId = setInterval(tick, intervalMs);
		return () => {
			clearTimeout(timeoutId);
			clearInterval(intervalId);
		};
	}, [intervalMs]);

	return now;
}
