import { readdir, stat } from "node:fs/promises";
import path from "node:path";

import { mapWithConcurrency } from "@citadel/common/src/universal/async/mapWithConcurrency.ts";

import type { DiskFile } from "./diskFile.type.ts";

/**
 * Tous les fichiers sous le dossier des médias, lus directement (le dossier est monté en lecture seule) : chemin, inode
 * et taille. Les chemins prennent des « / », comme ceux que donnent les outils
 */
export async function scanDataDir(dataDir: string): Promise<DiskFile[]> {
	const entries = await readdir(dataDir, {
		recursive: true,
		withFileTypes: true,
	});
	const filePaths = entries
		.filter((entry) => entry.isFile())
		.map((entry) =>
			path.join(entry.parentPath, entry.name).replaceAll("\\", "/"),
		);
	return mapWithConcurrency(filePaths, 64, async (filePath) => {
		const { ino, size } = await stat(filePath);
		return { path: filePath, inode: ino, sizeBytes: size };
	});
}
