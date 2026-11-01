import { JOB_DEFINITIONS } from "../../shared/jobDefinitions.ts";
import type { JobItem } from "../../shared/jobItem.type.ts";
import { nextCronRun } from "../../shared/nextCronRun.ts";
import { readStateJson } from "../state/readStateJson.ts";
import type { JobStateFile } from "./jobStateFile.type.ts";

type ScheduleEntry = { job: string; cron: string };

// Chaque job : son dernier passage (state/jobs/<job>.json) et le prochain, calculé
// depuis le planning (state/jobs/schedule.json, tiré de infra/ops/crontab)
export async function readJobs(): Promise<JobItem[]> {
	const schedule =
		(await readStateJson<ScheduleEntry[]>("jobs/schedule.json")) ?? [];
	const now = new Date();
	return Promise.all(
		JOB_DEFINITIONS.map(async (definition) => {
			const state = await readStateJson<JobStateFile>(
				`jobs/${definition.name}.json`,
			);
			const cron =
				schedule.find((entry) => entry.job === definition.name)?.cron ?? null;
			return {
				...definition,
				status: state?.status ?? "never",
				startedAt: state?.startedAt ?? null,
				finishedAt: state?.finishedAt ?? null,
				checks: state?.checks ?? [],
				cron,
				nextRunAt:
					cron === null
						? null
						: (nextCronRun(cron, now)?.toISOString() ?? null),
			};
		}),
	);
}
