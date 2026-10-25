import { type Request, type Response, Router } from "express";
import { z } from "zod";

import type { ActionStep } from "../../shared/actionStep.type.ts";
import { planServiceAction } from "../../shared/planServiceAction.ts";
import { ServiceActionEnum } from "../../shared/serviceAction.enum.ts";
import type { ServiceItem } from "../../shared/serviceItem.type.ts";
import { listServices } from "../docker/listServices.ts";
import { readContainerLogs } from "../docker/readContainerLogs.ts";
import { runActionStep } from "../docker/runActionStep.ts";
import { HttpError } from "../http/HttpError.ts";
import { writeAuditLog } from "../http/writeAuditLog.ts";

const actionSchema = z.enum(ServiceActionEnum);

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
