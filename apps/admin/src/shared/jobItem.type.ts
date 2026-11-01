import type { JobCheck } from "./jobCheck.type.ts";
import type { JobStatus } from "./jobStatus.type.ts";

// Un job d'infra-ops : son dernier passage et le prochain
export type JobItem = {
	name: string;
	label: string;
	description: string;
	monitored: boolean;
	status: JobStatus;
	startedAt: string | null;
	finishedAt: string | null;
	checks: JobCheck[];
	// La ligne de infra/ops/crontab, et le prochain passage qu'elle donne
	cron: string | null;
	nextRunAt: string | null;
};
