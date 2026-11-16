import { createSlidingWindowLimiter } from "@citadel/common/src/universal/limit/createSlidingWindowLimiter.ts";

import { env } from "../configuration/env.ts";
import { dockerRequest } from "../docker/dockerRequest.ts";
import { writeAuditLog } from "../http/writeAuditLog.ts";

// Un démarrage demandé au plus toutes les 30 s, quel que soit le visiteur : le temps que l'instance démarre, les
// requêtes suivantes de la page n'en relancent pas d'autre, et une rafale ne fait pas tourner Docker en boucle
const START_INTERVAL_MS = 30_000;
const starts = createSlidingWindowLimiter({
	limit: 1,
	windowMs: START_INTERVAL_MS,
});

/**
 * Démarre l'instance locale du backlog des médias, arrêtée pour inactivité : le même appel que le bouton « Démarrer »
 * de la console, à travers le filtre Docker, sur ce seul conteneur. Un échec n'est que journalisé : la page se
 * rechargera et redemandera
 */
export async function wakeLocalInstance(ip: string): Promise<void> {
	if (starts.record("start") !== null) return;
	try {
		await dockerRequest(`/containers/${env.LOCAL_INSTANCE_CONTAINER}/start`, {
			method: "POST",
		});
		writeAuditLog({ event: "wake", result: "ok", ip });
	} catch (error) {
		writeAuditLog({ event: "wake", result: "échec", ip });
		console.error("Réveil de l'instance locale impossible :", error);
	}
}
