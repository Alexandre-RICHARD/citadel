import { rename, writeFile } from "node:fs/promises";

/**
 * Un fichier JSON écrit à côté, puis renommé : qui le lit (l'instance locale, la console) ne le voit jamais à moitié.
 * Le renommage remplace l'ancien d'un seul coup
 */
export async function writeJsonAtomically(
	filePath: string,
	content: unknown,
): Promise<void> {
	const temporaryPath = `${filePath}.tmp`;
	await writeFile(temporaryPath, `${JSON.stringify(content)}\n`);
	await rename(temporaryPath, filePath);
}
