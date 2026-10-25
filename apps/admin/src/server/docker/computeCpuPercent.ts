import type { CpuSample } from "./cpuSample.type.ts";

// Docker et /proc ne donnent que des compteurs cumulés depuis le démarrage : l'usage se
// calcule entre deux relevés. Résultat en % d'UN cœur multiplié par le nombre de cœurs,
// comme `docker stats` (400 % = les 4 cœurs du N95 pleins), ou en % de la machine si
// cpuCount vaut 1.
export function computeCpuPercent(
	previous: CpuSample | undefined,
	current: CpuSample,
	cpuCount: number,
): number | null {
	if (!previous) return null;
	const totalDelta = current.total - previous.total;
	const usedDelta = current.used - previous.used;
	// Compteurs remis à zéro (conteneur redémarré) ou relevés trop rapprochés
	if (totalDelta <= 0 || usedDelta < 0) return null;
	return (usedDelta / totalDelta) * cpuCount * 100;
}
