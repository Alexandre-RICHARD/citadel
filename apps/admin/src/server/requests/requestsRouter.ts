import { type Response, Router } from "express";

import type { RequestItem } from "../../shared/requestItem.type.ts";
import { HttpError } from "../http/HttpError.ts";
import { readRequest } from "./readRequest.ts";

// Le suivi d'une demande à infra-ops (job, plan, déploiement, restauration…) : la
// console la relit jusqu'à la fin. null : pas encore reçue.
export const requestsRouter = Router();

requestsRouter.get(
	"/api/requests/:id",
	async (request, response: Response<RequestItem | null>) => {
		if (!/^[A-Za-z0-9-]{1,64}$/.test(request.params.id))
			throw new HttpError(400, "Identifiant invalide");
		response.json(await readRequest(request.params.id));
	},
);
