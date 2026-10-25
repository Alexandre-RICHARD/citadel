import type { DockerContainerDetails } from "./dockerContainerDetails.type.ts";
import { dockerRequest } from "./dockerRequest.ts";

// Par nom ou par identifiant : Docker accepte les deux
export async function inspectContainer(
	nameOrId: string,
): Promise<DockerContainerDetails> {
	const response = await dockerRequest(
		`/containers/${encodeURIComponent(nameOrId)}/json`,
	);
	return (await response.json()) as DockerContainerDetails;
}
