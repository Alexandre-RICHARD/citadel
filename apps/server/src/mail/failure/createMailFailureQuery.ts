import { daysBefore } from "@citadel/common/src/universal/date/daysBefore.ts";
import { Op } from "sequelize";

import { DatabaseError } from "../../error/DatabaseError.ts";
import type { MailKindEnum } from "../mailKind.enum.ts";
import { MailFailure } from "./MailFailure.ts";
import { MAIL_FAILURE_REASON_MAX_LENGTH } from "./mailFailureReasonMaxLength.ts";

// Enregistre un échec, et efface au passage ceux qui ont plus de `retentionDays` jours
export async function createMailFailureQuery(
	kind: MailKindEnum,
	reason: string,
	now: Date,
	retentionDays: number,
): Promise<void> {
	try {
		await MailFailure.create({
			kind,
			reason: reason.slice(0, MAIL_FAILURE_REASON_MAX_LENGTH),
		});
		await MailFailure.destroy({
			where: {
				createdAt: { [Op.lt]: daysBefore(now, retentionDays) },
			},
		});
	} catch (error) {
		throw new DatabaseError("Failed to insert new mail failure", {
			cause: error,
		});
	}
}
