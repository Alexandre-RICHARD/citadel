import type { NasEntry } from "@citadel/specs/src/projects/backlog/mediaState/nasEntry.type.ts";

// Un fichier, et un seul : sans fichier, rien à vérifier ; avec plusieurs (écart « Doublon »), la case reste grisée
export function isVerifiableEntry(
	entry: NasEntry | null,
): entry is NasEntry & { file: NonNullable<NasEntry["file"]> } {
	return (
		entry?.file !== null && entry?.file !== undefined && entry.fileCount <= 1
	);
}
