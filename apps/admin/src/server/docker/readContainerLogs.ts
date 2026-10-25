import { demuxDockerLogs } from "./demuxDockerLogs.ts";
import { dockerRequest } from "./dockerRequest.ts";
import { inspectContainer } from "./inspectContainer.ts";

const TAIL_LINES = 200;

// Les 200 dernières lignes, sorties standard et d'erreur mêlées, avec leur date
export async function readContainerLogs(name: string): Promise<string> {
	const details = await inspectContainer(name);
	const response = await dockerRequest(
		`/containers/${encodeURIComponent(name)}/logs?stdout=true&stderr=true&timestamps=true&tail=${TAIL_LINES}`,
	);
	return demuxDockerLogs(
		Buffer.from(await response.arrayBuffer()),
		details.Config.Tty,
	);
}
