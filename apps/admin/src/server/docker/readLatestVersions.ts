import { readStateJson } from "../state/readStateJson.ts";

type UpdatesFile = {
	images: { image: string; current: string; latest: string | null }[];
	versions: string[];
};

const OWN_IMAGE_PREFIX = "ghcr.io/alexandre-richard/citadel-";

// La dernière version publiée d'une image en service (« image:tag »), relevée chaque
// nuit par update-check (state/updates.json). Nos images suivent la dernière version de
// Citadel. null : pas encore relevée.
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
	const ownLatest = updates?.versions.at(-1) ?? null;
	return (image) =>
		image.startsWith(OWN_IMAGE_PREFIX)
			? ownLatest
			: (latest.get(image) ?? null);
}
