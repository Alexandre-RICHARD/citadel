import { Op } from "sequelize";

import { DatabaseError } from "../../error/DatabaseError.ts";
import type { MailKindEnum } from "../mailKind.enum.ts";
import { daysBefore } from "./daysBefore.ts";
import { MailFailure } from "./MailFailure.ts";
import { MAIL_FAILURE_REASON_MAX_LENGTH } from "./mailFailureReasonMaxLength.ts";

// Au-delà, un échec n'a plus rien à signaler : la règle des 3 mois de conservation
const RETENTION_DAYS = 90;
// Enregistre un échec, et efface au passage ceux qui ont dépassé la durée de conservation
export async function createMailFailureQuery(
	kind: MailKindEnum,
	reason: string,
	now: Date,
): Promise<void> {
	try {
		await MailFailure.create({
			kind,
			reason: reason.slice(0, MAIL_FAILURE_REASON_MAX_LENGTH),
		});
		await MailFailure.destroy({
			where: {
				createdAt: { [Op.lt]: daysBefore(now, RETENTION_DAYS) },
			},
		});
	} catch (error) {
		throw new DatabaseError("Failed to insert new mail failure", {
			cause: error,
		});
	}
}
