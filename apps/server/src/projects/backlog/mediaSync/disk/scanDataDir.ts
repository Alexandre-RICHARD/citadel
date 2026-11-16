import { readdir, stat } from "node:fs/promises";
import path from "node:path";

import { mapWithConcurrency } from "@citadel/common/src/universal/async/mapWithConcurrency.ts";

import type { DiskFile } from "./diskFile.type.ts";

const SAFE_INODE_MODULUS = BigInt(Number.MAX_SAFE_INTEGER) + 1n;

// Sous Linux (le NAS) un inode tient dans un entier sûr et reste tel quel. Les identifiants de fichier NTFS (poste de
// dev sous Windows) font 64 bits : on les replie dans l'intervalle sûr, ce qui garde l'égalité entre deux noms d'un même fichier
function toSafeInode(ino: bigint): number {
	return Number(ino % SAFE_INODE_MODULUS);
}

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
		const { ino, size } = await stat(filePath, { bigint: true });
		return { path: filePath, inode: toSafeInode(ino), sizeBytes: Number(size) };
	});
}
