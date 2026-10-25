import type { ActionStep } from "./actionStep.type.ts";
import { isRunningState } from "./isRunningState.ts";
import type { PlannableService } from "./plannableService.type.ts";
import { ServiceActionEnum } from "./serviceAction.enum.ts";

// Les étapes d'une action, dans l'ordre, comme Compose les ferait :
//   - démarrer : d'abord ce dont le service a besoin (Gluetun avant qBittorrent), en
//     attendant qu'il soit sain si compose.yml le demande ;
//   - arrêter : d'abord ceux qui ont besoin de lui. Arrêter Gluetun arrête donc aussi
//     qBittorrent et les *arr : sans lui, ils n'ont plus de réseau ;
//   - redémarrer : arrêter, puis démarrer tout ce qui a été arrêté.
// Partagé par le serveur (qui exécute) et le front (qui annonce les effets avant de confirmer).

function closure(
	targets: Iterable<string>,
	next: (name: string) => string[],
): Set<string> {
	const names = new Set<string>();
	const pending = [...targets];
	while (pending.length > 0) {
		const name = pending.pop()!;
		if (names.has(name)) continue;
		names.add(name);
		pending.push(...next(name));
	}
	return names;
}

// Dépendances avant ceux qui en ont besoin ; à égalité, l'ordre de la liste des services
function sortByDependencies(
	names: Set<string>,
	byName: Map<string, PlannableService>,
): string[] {
	const ordered: string[] = [];
	const visited = new Set<string>();

	function visit(name: string): void {
		if (visited.has(name) || !names.has(name)) return;
		visited.add(name);
		for (const dependency of byName.get(name)?.dependsOn ?? [])
			visit(dependency.name);
		ordered.push(name);
	}

	for (const name of byName.keys()) visit(name);
	return ordered;
}

function planStop(
	targets: string[],
	services: PlannableService[],
	byName: Map<string, PlannableService>,
): ActionStep[] {
	const withDependents = closure(targets, (name) =>
		services
			.filter((service) =>
				service.dependsOn.some((dependency) => dependency.name === name),
			)
			.map((service) => service.name),
	);
	return sortByDependencies(withDependents, byName)
		.reverse()
		.filter((name) => isRunningState(byName.get(name)?.state ?? ""))
		.map((name) => ({ name, operation: "stop", waitHealthy: false }));
}

function planStart(
	targets: string[],
	byName: Map<string, PlannableService>,
	// Arrêtés juste avant (redémarrage) : leur état dans la liste est encore « running »
	stoppedBefore: Set<string>,
): ActionStep[] {
	const withDependencies = closure(
		targets,
		(name) =>
			byName.get(name)?.dependsOn.map((dependency) => dependency.name) ?? [],
	);
	const toStart = sortByDependencies(withDependencies, byName).filter(
		(name) =>
			stoppedBefore.has(name) || !isRunningState(byName.get(name)?.state ?? ""),
	);
	return toStart.map((name) => ({
		name,
		operation: "start",
		waitHealthy: toStart.some((other) =>
			byName
				.get(other)
				?.dependsOn.some(
					(dependency) => dependency.name === name && dependency.waitHealthy,
				),
		),
	}));
}

export function planServiceAction(
	action: ServiceActionEnum,
	targets: string[],
	services: PlannableService[],
): ActionStep[] {
	const byName = new Map(services.map((service) => [service.name, service]));
	const knownTargets = targets.filter((name) => byName.has(name));

	if (action === ServiceActionEnum.START)
		return planStart(knownTargets, byName, new Set());
	if (action === ServiceActionEnum.STOP)
		return planStop(knownTargets, services, byName);

	const stopSteps = planStop(knownTargets, services, byName);
	const stopped = new Set(stopSteps.map((step) => step.name));
	return [
		...stopSteps,
		...planStart([...knownTargets, ...stopped], byName, stopped),
	];
}
