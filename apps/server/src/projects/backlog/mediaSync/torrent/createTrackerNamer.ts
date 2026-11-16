import type { TrackerDefinition } from "./trackerDefinition.type.ts";
import type { TrackerIdentity } from "./trackerIdentity.type.ts";

function hostOf(url: string): string {
	try {
		return new URL(url).hostname;
	} catch {
		return "adresse illisible";
	}
}

/**
 * Le tracker d'une adresse d'annonce, par son nom d'hôte : les adresses d'un même tracker (une de secours, par exemple)
 * se regroupent sous son nom
 */
export function createTrackerNamer(
	definitions: readonly TrackerDefinition[],
): (url: string) => TrackerIdentity {
	const nameByHost = new Map(
		definitions.flatMap(({ name, urls }) =>
			urls.map((url) => [hostOf(url), name] as const),
		),
	);
	return function nameTracker(url) {
		const host = hostOf(url);
		const name = nameByHost.get(host) ?? null;
		return { name, label: name ?? host };
	};
}
