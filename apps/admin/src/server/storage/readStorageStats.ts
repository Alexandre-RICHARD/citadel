import type { StorageStats } from "../../shared/storageStats.type.ts";
import { readStateJson } from "../state/readStateJson.ts";

type StorageFile = Omit<
	Extract<StorageStats, { available: true }>,
	"available"
>;

export async function readStorageStats(): Promise<StorageStats> {
	const storage = await readStateJson<StorageFile>("storage.json");
	if (!storage)
		return { available: false, reason: "aucun relevé (job storage-stats)" };
	return { available: true, ...storage };
}
