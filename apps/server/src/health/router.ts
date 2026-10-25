import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import { type Response, Router } from "express";

import { env } from "../configuration/env.ts";
import { isDatabaseReachable } from "./isDatabaseReachable.ts";

async function sendHealth(response: Response): Promise<void> {
	const isDatabaseUp = await isDatabaseReachable();

	response
		.status(
			isDatabaseUp
				? HttpStatutCodeSuccessEnum.SUCCESS
				: HttpStatutCodeErrorEnum.SERVICE_UNAVAILABLE,
		)
		// Toujours l'état du moment, jamais une réponse gardée en cache
		.set("Cache-Control", "no-store")
		.json({
			status: isDatabaseUp ? "ok" : "error",
			version: env.APP_VERSION,
			db: isDatabaseUp ? "up" : "down",
		});
}

const healthRouter = Router();

// Hors des endpoints typés de specs : lu par des scripts (citadel deploy, pnpm release, healthcheck Docker),
// et sa réponse 503 garde le même format que la 200
healthRouter.get("/health", (_request, response) => {
	void sendHealth(response);
});

export { healthRouter };
