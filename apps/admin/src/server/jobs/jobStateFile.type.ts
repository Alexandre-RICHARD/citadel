import type { JobCheck } from "../../shared/jobCheck.type.ts";

// state/jobs/<job>.json, écrit par infra-ops à chaque passage (infra/citadel, run_job)
export type JobStateFile = {
	job: string;
	status: "ok" | "fail" | "running";
	startedAt: string;
	finishedAt: string | null;
	checks: JobCheck[];
};
