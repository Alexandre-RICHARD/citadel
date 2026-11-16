import type { ErrorResponseDto } from "@citadel/specs/src/specUtils/error/errorResponseDto.type.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import express from "express";

import { wakeLocalInstance } from "./wakeLocalInstance.ts";

// Ce qu'attend le front avant de recharger la page : le temps que le serveur démarre et passe son healthcheck
const RETRY_AFTER_SECONDS = 5;

/**
 * Le port de réveil de la console, que seul Caddy appelle, par le réseau Docker, quand l'instance locale du backlog
 * des médias ne répond pas (port 8003 du NAS, voir le Caddyfile). Il n'est publié nulle part : ni sur le LAN, ni sur
 * Tailscale. Sans mot de passe, mais il ne sait faire qu'une chose, fixe et limitée en fréquence : démarrer ce
 * conteneur. Toute requête, quel que soit son chemin, répond 503 au format des erreurs du site : le front reconnaît
 * le code, affiche « Démarrage… » et recharge la page
 */
export const wakeApp = express();
wakeApp.disable("x-powered-by");
wakeApp.disable("etag");

wakeApp.use(async (request, response) => {
	// Caddy transmet l'IP du visiteur, comme au serveur du site
	const ip = request.header("X-Real-IP") ?? request.ip ?? "inconnue";
	await wakeLocalInstance(ip);
	const body: ErrorResponseDto<TechnicalErrorCodeEnum> = {
		code: TechnicalErrorCodeEnum.LOCAL_INSTANCE_STARTING,
		message: "Local instance is starting",
	};
	response
		.status(503)
		.setHeader("Retry-After", String(RETRY_AFTER_SECONDS))
		.setHeader("Cache-Control", "no-store")
		.json(body);
});
