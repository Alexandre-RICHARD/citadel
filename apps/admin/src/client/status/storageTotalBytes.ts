import type { StorageStats } from "../../shared/storageStats.type";

type AvailableStorage = Extract<StorageStats, { available: true }>;

// Tout ce que l'infra fait vivre sur les disques : Docker (images, conteneurs, volumes,
// cache de build) et les configs et données des services. Sans les sauvegardes, à part.
export function storageTotalBytes(stats: AvailableStorage): number {
	const { imagesBytes, containersBytes, volumesBytes, buildCacheBytes } =
		stats.docker;
	return (
		imagesBytes +
		containersBytes +
		volumesBytes +
		buildCacheBytes +
		(stats.appdataBytes ?? 0)
	);
}
