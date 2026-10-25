import type { ServiceDependency } from "./serviceDependency.type.ts";

// Un conteneur de Citadel, tel que la console l'affiche
export type ServiceItem = {
	// Nom du conteneur, le même que celui du service dans compose.yml
	name: string;
	// Labels citadel.* de compose.yml
	label: string;
	description: string;
	group: string;
	mode: string;
	controllable: boolean;
	// État Docker : running, exited, created, restarting…
	state: string;
	// healthy, unhealthy, starting ; null sans healthcheck
	health: string | null;
	startedAt: string | null;
	restartCount: number;
	// null : arrêté, ou première mesure (le CPU se calcule entre deux relevés)
	cpuPercent: number | null;
	memoryBytes: number | null;
	// null : aucune limite
	memoryLimitBytes: number | null;
	image: string;
	version: string;
	dependsOn: ServiceDependency[];
};
