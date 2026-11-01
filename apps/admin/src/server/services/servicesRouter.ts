import { type Request, type Response, Router } from "express";
import { z } from "zod";

import type { ActionStep } from "../../shared/actionStep.type.ts";
import { LIMITS_EXCLUDED_SERVICES } from "../../shared/limitsExcludedServices.ts";
import { planServiceAction } from "../../shared/planServiceAction.ts";
import { ServiceActionEnum } from "../../shared/serviceAction.enum.ts";
import type { ServiceItem } from "../../shared/serviceItem.type.ts";
import { readJellyfinActivity } from "../access/readJellyfinActivity.ts";
import { listServices } from "../docker/listServices.ts";
import { readContainerLogs } from "../docker/readContainerLogs.ts";
import { runActionStep } from "../docker/runActionStep.ts";
import { HttpError } from "../http/HttpError.ts";
import { writeAuditLog } from "../http/writeAuditLog.ts";
import { enqueueRequest } from "../queue/enqueueRequest.ts";

const actionSchema = z.enum(ServiceActionEnum);

// Les bornes basses d'infra/citadel (citadel limits), qui revérifie tout et borne aussi
// par le haut (la mémoire et les cœurs du NAS). null : inchangé.
const MIN_MEMORY_BYTES = 64 * 1024 ** 2;
const limitsSchema = z
	.object({
		memoryBytes: z
			.number()
			.int()
			.min(MIN_MEMORY_BYTES, "64 Mio au moins")
			.max(1e15)
			.nullable(),
		cpus: z
			.number()
			.min(0.1, "0,1 cœur au moins")
			.max(99)
			.multipleOf(0.01, "Deux décimales au plus")
			.nullable(),
	})
	.refine(
		(limits) => limits.memoryBytes !== null || limits.cpus !== null,
		"Rien à changer",
	);

const JELLYFIN_CONTAINER = "media-jellyfin";

// Une seule action à la fois : deux clics croisés (démarrer Gluetun pendant qu'on l'arrête)
// donneraient un état imprévisible
let actionInProgress: string | null = null;

function parseAction(value: unknown): ServiceActionEnum {
	const action = actionSchema.safeParse(value);
	if (!action.success) throw new HttpError(400, "Action inconnue");
	return action.data;
}

async function findService(name: string): Promise<ServiceItem> {
	const service = (await listServices()).find((item) => item.name === name);
	if (!service) throw new HttpError(404, `Aucun service nommé ${name}`);
	return service;
}

async function runAction(
	request: Request,
	action: ServiceActionEnum,
	target: string,
	targetNames: string[],
	services: ServiceItem[],
): Promise<ActionStep[]> {
	const steps = planServiceAction(action, targetNames, services);

	// Seuls les conteneurs étiquetés citadel.controllable, même entraînés par un autre
	const refused = steps
		.map((step) => services.find((service) => service.name === step.name))
		.filter((service) => service?.controllable !== true)
		.map((service) => service?.label ?? "?");
	if (refused.length > 0)
		throw new HttpError(
			403,
			`Non pilotable depuis la console : ${refused.join(", ")}`,
		);

	// Jellyfin ne s'arrête pas sous les yeux de quelqu'un (§14.3) : arrêt ou redémarrage
	// refusés pendant une lecture
	if (
		steps.some(
			(step) => step.name === JELLYFIN_CONTAINER && step.operation === "stop",
		)
	) {
		const activity = await readJellyfinActivity();
		if (activity.available && activity.playbacks.length > 0)
			throw new HttpError(
				409,
				`Jellyfin : ${activity.playbacks.length} lecture(s) en cours, arrêt refusé`,
			);
	}

	if (actionInProgress !== null)
		throw new HttpError(409, `Action déjà en cours : ${actionInProgress}`);
	actionInProgress = `${action} ${target}`;

	const audit = { event: "action", action, target, ip: request.ip };
	try {
		// Une étape après l'autre : l'ordre compte (Gluetun avant qBittorrent)
		await steps.reduce(
			(previous, step) => previous.then(() => runActionStep(step)),
			Promise.resolve(),
		);
		writeAuditLog({ ...audit, result: "ok", steps: steps.length });
		return steps;
	} catch (error) {
		writeAuditLog({
			...audit,
			result: "échec",
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	} finally {
		actionInProgress = null;
	}
}

export const servicesRouter = Router();

servicesRouter.get(
	"/api/services",
	async (_request, response: Response<ServiceItem[]>) => {
		response.json(await listServices());
	},
);

servicesRouter.get("/api/services/:name/logs", async (request, response) => {
	const service = await findService(request.params.name);
	response.type("text/plain").send(await readContainerLogs(service.name));
});

async function findLimitsTarget(name: string): Promise<ServiceItem> {
	const service = await findService(name);
	if (LIMITS_EXCLUDED_SERVICES.includes(service.name))
		throw new HttpError(403, `Limites non modifiables : ${service.label}`);
	return service;
}

// Limites changées à chaud (docker update) par infra-ops : une demande, suivie par
// /api/requests/:id. Avant la route générique, que « limits » ne doit pas atteindre.
servicesRouter.post(
	"/api/services/:name/limits",
	async (request, response: Response<{ requestId: string }>) => {
		const service = await findLimitsTarget(request.params.name);
		const parsed = limitsSchema.safeParse(request.body);
		if (!parsed.success)
			throw new HttpError(
				400,
				parsed.error.issues[0]?.message ?? "Limites invalides",
			);
		const { memoryBytes, cpus } = parsed.data;
		response.json({
			requestId: await enqueueRequest(
				{
					action: "service-limits",
					service: service.name,
					memoryBytes: memoryBytes === null ? "-" : String(memoryBytes),
					cpus: cpus === null ? "-" : cpus.toFixed(2),
				},
				request.ip,
			),
		});
	},
);

// Le conteneur recréé depuis compose.yml : ses limites d'origine
servicesRouter.post(
	"/api/services/:name/limits/reset",
	async (request, response: Response<{ requestId: string }>) => {
		const service = await findLimitsTarget(request.params.name);
		response.json({
			requestId: await enqueueRequest(
				{ action: "service-limits-reset", service: service.name },
				request.ip,
			),
		});
	},
);

servicesRouter.post(
	"/api/services/:name/:action",
	async (request, response: Response<ActionStep[]>) => {
		const action = parseAction(request.params.action);
		const services = await listServices();
		const service = services.find((item) => item.name === request.params.name);
		if (!service)
			throw new HttpError(404, `Aucun service nommé ${request.params.name}`);
		response.json(
			await runAction(request, action, service.name, [service.name], services),
		);
	},
);

servicesRouter.post(
	"/api/groups/:group/:action",
	async (request, response: Response<ActionStep[]>) => {
		const action = parseAction(request.params.action);
		const { group } = request.params;
		const services = await listServices();
		const targets = services
			.filter((service) => service.group === group && service.controllable)
			.map((service) => service.name);
		if (targets.length === 0)
			throw new HttpError(404, `Aucun service pilotable dans ${group}`);
		response.json(await runAction(request, action, group, targets, services));
	},
);
