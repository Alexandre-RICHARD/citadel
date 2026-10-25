import type { CpuSample } from "../docker/cpuSample.type.ts";

// Première ligne de /proc/stat : « cpu  user nice system idle iowait irq softirq steal … »,
// le temps passé par tous les cœurs dans chaque état depuis le démarrage. Attente des
// disques (iowait) comptée comme repos : le processeur n'y travaille pas.
export function parseProcStat(content: string): CpuSample | null {
	const fields = content.split("\n")[0]?.trim().split(" ").filter(Boolean);
	if (fields?.[0] !== "cpu") return null;
	const times = fields.slice(1, 9).map(Number);
	const total = times.reduce((sum, time) => sum + time, 0);
	const idle = (times[3] ?? 0) + (times[4] ?? 0);
	return { used: total - idle, total };
}
