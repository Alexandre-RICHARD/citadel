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
	// En cœurs (1,5 = un cœur et demi) ; null : aucune limite
	cpuLimit: number | null;
	// Limites changées à chaud depuis la console, pas encore remises à celles de compose.yml
	limitsChanged: boolean;
	// La console peut changer ses limites (pas elle-même, ni infra-ops, ni le filtre Docker)
	limitsEditable: boolean;
	image: string;
	version: string;
	// La plus récente publiée de la même forme (update-check) ; null : pas relevée
	latestVersion: string | null;
	// Label citadel.release-notes : où lire ce qui change
	releaseNotesUrl: string | null;
	// Label citadel.auto-stop (« 3h ») : arrêté par infra-ops au-delà
	autoStop: string | null;
	dependsOn: ServiceDependency[];
};
