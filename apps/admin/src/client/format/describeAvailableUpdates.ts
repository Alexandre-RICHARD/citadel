import { isOwnImage } from "../../shared/isOwnImage";
import type { ServiceItem } from "../../shared/serviceItem.type";

// Le tableau des versions en texte, à coller dans une conversation : une ligne par image tierce qui a une version plus
// récente, avec ses notes de version. Les services qui partagent une image et une version (base du site et de
// pré-prod) ne font qu'une ligne. Vide : tout est à jour
export function describeAvailableUpdates(services: ServiceItem[]): string {
	const lines = new Map<string, string>();
	for (const service of services) {
		const { latestVersion } = service;
		if (
			isOwnImage(service.image) ||
			latestVersion === null ||
			latestVersion === service.version
		)
			continue;
		const image = service.image.split(":")[0] ?? service.image;
		const key = `${image}@${service.version}`;
		const notes =
			service.releaseNotesUrl === null ? "" : ` (${service.releaseNotesUrl})`;
		lines.set(key, `${image} : ${service.version} → ${latestVersion}${notes}`);
	}
	return [...lines.values()].join("\n");
}
