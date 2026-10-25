import type { DiskUsage } from "./diskUsage.type.ts";
import type { TemperatureReading } from "./temperatureReading.type.ts";

// Le NAS lui-même, pas un conteneur
export type SystemSnapshot = {
	cpuPercent: number | null;
	cpuCount: number;
	memoryTotalBytes: number;
	memoryAvailableBytes: number;
	uptimeSeconds: number;
	loadAverage: number[];
	disks: DiskUsage[];
	temperatures: TemperatureReading[];
};
