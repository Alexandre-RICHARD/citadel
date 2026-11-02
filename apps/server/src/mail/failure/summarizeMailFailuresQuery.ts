import { daysBefore } from "@citadel/common/src/universal/date/daysBefore.ts";
import { Op } from "sequelize";

import { DatabaseError } from "../../error/DatabaseError.ts";
import { MailFailure } from "./MailFailure.ts";
import type { MailFailureSummaryBean } from "./mailFailureSummaryBean.type.ts";

// Le nombre d'échecs des `windowDays` derniers jours, et la date du plus récent
export async function summarizeMailFailuresQuery(
	windowDays: number,
	now: Date,
): Promise<MailFailureSummaryBean> {
	const where = {
		createdAt: { [Op.gte]: daysBefore(now, windowDays) },
	};
	try {
		const [count, lastFailure] = await Promise.all([
			MailFailure.count({ where }),
			MailFailure.findOne({ where, order: [["createdAt", "DESC"]] }),
		]);
		return {
			windowDays,
			count,
			lastFailedAt: lastFailure?.createdAt ?? null,
		};
	} catch (error) {
		throw new DatabaseError("Failed to summarize mail failures", {
			cause: error,
		});
	}
}
