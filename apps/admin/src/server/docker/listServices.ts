import type { ServiceItem } from "../../shared/serviceItem.type.ts";
import { computeCpuPercent } from "./computeCpuPercent.ts";
import type { CpuSample } from "./cpuSample.type.ts";
import type { DockerContainerSummary } from "./dockerContainerSummary.type.ts";
import { dockerRequest } from "./dockerRequest.ts";
import type { DockerStats } from "./dockerStats.type.ts";
import { imageVersion } from "./imageVersion.ts";
import { inspectContainer } from "./inspectContainer.ts";
import { parseDependsOn } from "./parseDependsOn.ts";

// Ordre d'affichage : groupes comme dans compose.yml, les « toujours allumés » en tête
const GROUP_ORDER = ["infra", "site-prod", "site-preprod", "media"];
const MODE_ORDER = ["always", "on-demand", "job"];

// Dernier relevé CPU de chaque conteneur : l'usage se calcule à la requête suivante.
// Rien ne tourne en fond : sans personne sur la console, aucun relevé.
const previousCpuSamples = new Map<string, CpuSample>();

function rank(order: string[], value: string): number {
	const index = order.indexOf(value);
	return index === -1 ? order.length : index;
}

// one-shot : une mesure immédiate, sans attendre la suivante (1 à 2 s de plus sinon)
async function readStats(id: string): Promise<DockerStats | null> {
	try {
		const response = await dockerRequest(
			`/containers/${id}/stats?stream=false&one-shot=true`,
		);
		return (await response.json()) as DockerStats;
	} catch {
		return null;
	}
}

function cpuPercentOf(id: string, stats: DockerStats | null): number | null {
	const systemUsage = stats?.cpu_stats.system_cpu_usage;
	if (!stats || systemUsage === undefined) return null;
	const sample = {
		used: stats.cpu_stats.cpu_usage.total_usage,
		total: systemUsage,
	};
	const percent = computeCpuPercent(
		previousCpuSamples.get(id),
		sample,
		stats.cpu_stats.online_cpus ?? 1,
	);
	previousCpuSamples.set(id, sample);
	return percent;
}

// Comme `docker stats` : sans le cache de fichiers que le noyau peut libérer à tout moment
function memoryOf(stats: DockerStats | null): number | null {
	const usage = stats?.memory_stats.usage;
	if (usage === undefined) return null;
	return usage - (stats?.memory_stats.stats?.inactive_file ?? 0);
}

async function toServiceItem(
	summary: DockerContainerSummary,
): Promise<ServiceItem> {
	const running = summary.State === "running";
	const [details, stats] = await Promise.all([
		inspectContainer(summary.Id),
		running ? readStats(summary.Id) : Promise.resolve(null),
	]);
	const labels = summary.Labels;

	return {
		name: summary.Names[0]?.replace("/", "") ?? summary.Id.slice(0, 12),
		label: labels["citadel.name"] ?? summary.Names[0] ?? "",
		description: labels["citadel.description"] ?? "",
		group: labels["citadel.group"] ?? "",
		mode: labels["citadel.mode"] ?? "",
		controllable: labels["citadel.controllable"] === "true",
		state: summary.State,
		health: details.State.Health?.Status ?? null,
		startedAt: running ? details.State.StartedAt : null,
		restartCount: details.RestartCount,
		cpuPercent: running ? cpuPercentOf(summary.Id, stats) : null,
		memoryBytes: running ? memoryOf(stats) : null,
		memoryLimitBytes: details.HostConfig.Memory || null,
		image: summary.Image,
		version: imageVersion(summary.Image),
		dependsOn: parseDependsOn(labels["com.docker.compose.depends_on"]),
	};
}

// Les conteneurs de Citadel : ceux qui portent les labels citadel.* de compose.yml
export async function listServices(): Promise<ServiceItem[]> {
	const filters = encodeURIComponent(
		JSON.stringify({ label: ["citadel.group"] }),
	);
	const response = await dockerRequest(
		`/containers/json?all=true&filters=${filters}`,
	);
	const summaries = (await response.json()) as DockerContainerSummary[];
	const services = await Promise.all(summaries.map(toServiceItem));

	return services.sort(
		(first, second) =>
			rank(GROUP_ORDER, first.group) - rank(GROUP_ORDER, second.group) ||
			rank(MODE_ORDER, first.mode) - rank(MODE_ORDER, second.mode) ||
			first.label.localeCompare(second.label, "fr"),
	);
}
