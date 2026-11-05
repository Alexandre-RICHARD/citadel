import { UserDataProjectEnum } from "@citadel/specs/src/projects/auth/enum/userDataProject.enum.ts";
import { z } from "zod";

import type { RestoreJournalLineBean } from "../../bean/restoreJournalLineBean.type.ts";
import { RestoreJournalActionEnum } from "../../enum/restoreJournalAction.enum.ts";

const common = {
	at: z.iso.datetime().transform((at) => new Date(at)),
	userId: z.number().int().positive(),
};

const lineSchema = z.discriminatedUnion("action", [
	z.object({
		...common,
		action: z.enum([
			RestoreJournalActionEnum.ACCOUNT_DELETED,
			RestoreJournalActionEnum.SECURITY_CHANGED,
		]),
	}),
	z.object({
		...common,
		action: z.literal(RestoreJournalActionEnum.PROJECT_DATA_DELETED),
		projects: z.array(z.enum(UserDataProjectEnum)).min(1),
	}),
	z.object({
		...common,
		action: z.literal(RestoreJournalActionEnum.EMAIL_CHANGED),
		email: z.string().min(1),
	}),
]);

// Une ligne du journal, relue telle qu'écrite ; null : illisible (fichier abîmé, ligne coupée par un arrêt brutal)
export function parseRestoreJournalLine(
	text: string,
): RestoreJournalLineBean | null {
	let value: unknown;
	try {
		value = JSON.parse(text);
	} catch {
		return null;
	}
	const parsed = lineSchema.safeParse(value);
	return parsed.success ? parsed.data : null;
}
