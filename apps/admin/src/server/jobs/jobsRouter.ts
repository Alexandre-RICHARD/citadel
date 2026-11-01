import { type Response, Router } from "express";

import { JOB_DEFINITIONS } from "../../shared/jobDefinitions.ts";
import type { JobItem } from "../../shared/jobItem.type.ts";
import { HttpError } from "../http/HttpError.ts";
import { enqueueRequest } from "../queue/enqueueRequest.ts";
import { readStateText } from "../state/readStateText.ts";
import { readJobs } from "./readJobs.ts";

function knownJob(name: string): string {
	if (!JOB_DEFINITIONS.some((definition) => definition.name === name))
		throw new HttpError(404, `Aucun job nommé ${name}`);
	return name;
}

// Les jobs d'infra-ops : dernier résultat, prochain passage, log, « Lancer maintenant »
export const jobsRouter = Router();

jobsRouter.get("/api/jobs", async (_request, response: Response<JobItem[]>) => {
	response.json(await readJobs());
});

jobsRouter.get("/api/jobs/:job/log", async (request, response) => {
	const log = await readStateText(`jobs/${knownJob(request.params.job)}.log`);
	response.type("text/plain").send(log ?? "");
});

// La demande part à infra-ops ; la console suit ensuite la demande (/api/requests/:id)
jobsRouter.post(
	"/api/jobs/:job/run",
	async (request, response: Response<{ requestId: string }>) => {
		const job = knownJob(request.params.job);
		response.json({
			requestId: await enqueueRequest({ action: "run-job", job }, request.ip),
		});
	},
);
