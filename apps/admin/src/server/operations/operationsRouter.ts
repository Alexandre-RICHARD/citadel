import express, { type Request, type Response, Router } from "express";
import { z } from "zod";

import type { OperationsStatus } from "../../shared/operationsStatus.type.ts";
import { HttpError } from "../http/HttpError.ts";
import { enqueueRequest } from "../queue/enqueueRequest.ts";
import { saveUpload } from "../queue/saveUpload.ts";
import { readOperationsStatus } from "./readOperationsStatus.ts";

// Les mêmes règles qu'infra-ops, qui revérifie tout : ici, pour répondre tout de suite
// à une saisie fausse
const versionSchema = z.object({
	version: z
		.string()
		.regex(/^v\d{4}\.\d{2}\.\d{2}(\.\d+)?$/, "Version invalide"),
});
// Un dump du HDD (<kind>/<nom>) ou du Drive (drive:<kind>/<nom>)
const BACKUP_SOURCE =
	/^(drive:)?(daily|pre-deploy|pre-restore)\/citadel-\d{8}-\d{6}-[\w.-]+\.sql\.zst$/;
const UPLOAD_SOURCE = /^upload:[A-Za-z0-9-]{1,64}$/;
const restoreSchema = z.object({
	source: z
		.string()
		.refine(
			(source) => BACKUP_SOURCE.test(source) || UPLOAD_SOURCE.test(source),
			"Dump inconnu",
		),
	confirmation: z.literal("RESTAURER", "Tape RESTAURER pour confirmer"),
});
const backupDeleteSchema = z.object({
	source: z.string().regex(BACKUP_SOURCE, "Dump inconnu"),
});
const bannerSchema = z.object({
	message: z
		.string()
		.trim()
		.min(1, "Message vide")
		.max(500, "500 caractères au plus"),
	// AAAA-MM-JJ (champ date de la console) ; vide : jusqu'à ce qu'on le retire
	endsAt: z.union([z.literal(""), z.iso.date("Date de fin invalide")]),
});
const maintenanceSchema = z.object({ enabled: z.boolean() });

// Un dump de quelques Mo ; 512 Mo laisse une large marge sans laisser remplir le SSD
const UPLOAD_LIMIT = "512mb";
const ZSTD_MAGIC = Buffer.from([0x28, 0xb5, 0x2f, 0xfd]);

function parse<T>(schema: z.ZodType<T>, body: unknown): T {
	const result = schema.safeParse(body);
	if (!result.success)
		throw new HttpError(
			400,
			result.error.issues[0]?.message ?? "Demande invalide",
		);
	return result.data;
}

async function enqueue(
	request: Request,
	response: Response<{ requestId: string }>,
	payload: Record<string, string> & { action: string },
): Promise<void> {
	response.json({ requestId: await enqueueRequest(payload, request.ip) });
}

// Mises en production, sauvegardes et restauration, bandeau et maintenance du site,
// nettoyage de Docker. Chaque action est
// une demande déposée pour infra-ops ; la console la suit par /api/requests/:id
export const operationsRouter = Router();

operationsRouter.get(
	"/api/operations",
	async (_request, response: Response<OperationsStatus>) => {
		response.json(await readOperationsStatus());
	},
);

// Le plan d'abord (rien ne change), puis la même action confirmée
operationsRouter.post(
	"/api/operations/deploy-plan",
	async (request, response) => {
		const { version } = parse(versionSchema, request.body);
		await enqueue(request, response, { action: "deploy-plan", version });
	},
);

operationsRouter.post("/api/operations/deploy", async (request, response) => {
	const { version } = parse(versionSchema, request.body);
	await enqueue(request, response, { action: "deploy", version });
});

operationsRouter.post(
	"/api/operations/rollback-plan",
	async (request, response) => {
		await enqueue(request, response, { action: "rollback-plan" });
	},
);

operationsRouter.post("/api/operations/rollback", async (request, response) => {
	await enqueue(request, response, { action: "rollback" });
});

operationsRouter.post("/api/operations/restore", async (request, response) => {
	const { source, confirmation } = parse(restoreSchema, request.body);
	await enqueue(request, response, {
		action: "restore-db",
		source,
		confirmation,
	});
});

// Un dump du HDD ou du Drive, avec ses fichiers compagnons (.sha256, .manifest.json)
operationsRouter.post(
	"/api/operations/backup-delete",
	async (request, response) => {
		const { source } = parse(backupDeleteSchema, request.body);
		await enqueue(request, response, { action: "backup-delete", source });
	},
);

// Les images inutiles, hors retours arrière (citadel docker-cleanup)
operationsRouter.post(
	"/api/operations/docker-cleanup",
	async (request, response) => {
		await enqueue(request, response, { action: "docker-cleanup" });
	},
);

// En secours, un dump envoyé depuis ton PC : déposé tel quel, contrôlé par infra-ops
// au moment de la restauration
operationsRouter.post(
	"/api/operations/restore-upload",
	express.raw({ type: "application/octet-stream", limit: UPLOAD_LIMIT }),
	async (request, response: Response<{ uploadId: string }>) => {
		const body: unknown = request.body;
		if (!Buffer.isBuffer(body) || !body.subarray(0, 4).equals(ZSTD_MAGIC))
			throw new HttpError(400, "Pas un dump .sql.zst (archive zstd attendue)");
		response.json({ uploadId: `upload:${await saveUpload(body)}` });
	},
);

operationsRouter.post("/api/operations/banner", async (request, response) => {
	const { message, endsAt } = parse(bannerSchema, request.body);
	// Fin de journée, heure de Paris : le bandeau reste affiché tout le jour choisi
	await enqueue(request, response, {
		action: "banner-set",
		message,
		endsAt: endsAt === "" ? "" : `${endsAt}T23:59:59+01:00`,
	});
});

operationsRouter.post(
	"/api/operations/banner/clear",
	async (request, response) => {
		await enqueue(request, response, { action: "banner-clear" });
	},
);

operationsRouter.post(
	"/api/operations/maintenance",
	async (request, response) => {
		const { enabled } = parse(maintenanceSchema, request.body);
		await enqueue(request, response, {
			action: enabled ? "maintenance-on" : "maintenance-off",
		});
	},
);
