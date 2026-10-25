import { readFile, statfs } from "node:fs/promises";
import { availableParallelism, loadavg } from "node:os";
import { setTimeout as sleep } from "node:timers/promises";

import type { DiskUsage } from "../../shared/diskUsage.type.ts";
import type { SystemSnapshot } from "../../shared/systemSnapshot.type.ts";
import { env } from "../configuration/env.ts";
import { computeCpuPercent } from "../docker/computeCpuPercent.ts";
import type { CpuSample } from "../docker/cpuSample.type.ts";
import { parseMemInfo } from "./parseMemInfo.ts";
import { parseProcStat } from "./parseProcStat.ts";
import { readTemperatures } from "./readTemperatures.ts";

// /proc/stat, /proc/meminfo, /proc/uptime : dans un conteneur, ce sont ceux du NAS
// entier (Docker n'isole pas ces chiffres), sans rien monter.

let previousCpuSample: CpuSample | undefined;

async function readCpuSample(): Promise<CpuSample | null> {
	return parseProcStat(await readFile("/proc/stat", "utf8"));
}

// Premier appel : deux relevés à 300 ms d'écart, pour afficher un chiffre tout de suite
async function readCpuPercent(): Promise<number | null> {
	if (!previousCpuSample) {
		previousCpuSample = (await readCpuSample()) ?? undefined;
		await sleep(300);
	}
	const sample = await readCpuSample();
	if (!sample) return null;
	const percent = computeCpuPercent(previousCpuSample, sample, 1);
	previousCpuSample = sample;
	return percent;
}

// statfs donne la taille et l'espace libre du disque qui porte ce dossier
async function readDisk(name: string, path: string): Promise<DiskUsage | null> {
	try {
		const stats = await statfs(path);
		return {
			name,
			totalBytes: stats.blocks * stats.bsize,
			freeBytes: stats.bavail * stats.bsize,
		};
	} catch {
		return null;
	}
}

export async function readSystemSnapshot(): Promise<SystemSnapshot> {
	const [cpuPercent, memInfo, uptime, ssd, hdd, temperatures] =
		await Promise.all([
			readCpuPercent(),
			readFile("/proc/meminfo", "utf8"),
			readFile("/proc/uptime", "utf8"),
			readDisk("SSD (Volume1)", env.SSD_PATH),
			readDisk("HDD (Volume2)", env.HDD_PATH),
			readTemperatures(),
		]);
	const memory = parseMemInfo(memInfo);

	return {
		cpuPercent,
		cpuCount: availableParallelism(),
		memoryTotalBytes: memory.totalBytes,
		memoryAvailableBytes: memory.availableBytes,
		uptimeSeconds: Number.parseFloat(uptime),
		loadAverage: loadavg(),
		disks: [ssd, hdd].filter((disk): disk is DiskUsage => disk !== null),
		temperatures,
	};
}
