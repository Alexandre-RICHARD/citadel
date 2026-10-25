import { setTimeout as sleep } from "node:timers/promises";

import type { ActionStep } from "../../shared/actionStep.type.ts";
import { HttpError } from "../http/HttpError.ts";
import { dockerRequest } from "./dockerRequest.ts";
import { inspectContainer } from "./inspectContainer.ts";

// Gluetun met 10 à 30 s à monter le VPN ; au-delà de 3 min, quelque chose cloche
const HEALTH_TIMEOUT_MS = 3 * 60 * 1000;
const HEALTH_POLL_MS = 2000;

async function waitUntilHealthy(name: string, deadline: number): Promise<void> {
	const details = await inspectContainer(name);
	const health = details.State.Health?.Status;
	// Sans healthcheck, « démarré » suffit
	if (health === undefined || health === "healthy") return;
	if (details.State.Status !== "running")
		throw new HttpError(502, `${name} s'est arrêté pendant son démarrage`);
	if (Date.now() > deadline)
		throw new HttpError(
			504,
			`${name} n'est toujours pas sain après 3 min : voir ses logs`,
		);
	await sleep(HEALTH_POLL_MS);
	await waitUntilHealthy(name, deadline);
}

// Une étape : docker start ou docker stop (qui attend l'arrêt), puis l'attente éventuelle
export async function runActionStep(step: ActionStep): Promise<void> {
	await dockerRequest(
		`/containers/${encodeURIComponent(step.name)}/${step.operation}`,
		{ method: "POST" },
	);
	if (step.waitHealthy)
		await waitUntilHealthy(step.name, Date.now() + HEALTH_TIMEOUT_MS);
}
