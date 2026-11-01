import { readStateJson } from "../state/readStateJson.ts";

type UpdatesFile = {
	images: { image: string; current: string; latest: string | null }[];
};

// La dernière version publiée d'une image tierce en service (« image:tag »), relevée
// chaque nuit par update-check (state/updates.json). null : pas encore relevée, ou une
// image de Citadel (update-check ne les compare pas).
export async function readLatestVersions(): Promise<
	(image: string) => string | null
> {
	const updates = await readStateJson<UpdatesFile>("updates.json");
	const latest = new Map(
		(updates?.images ?? []).map((entry) => [
			`${entry.image}:${entry.current}`,
			entry.latest,
		]),
	);
	return (image) => latest.get(image) ?? null;
}
