import { z } from "zod";

import { ValidationIssueCodeEnum } from "../../../../../specUtils/error/validationIssueCode.enum.ts";
import { bodyIdSchema } from "../../../../../specUtils/schemaValidator/id/bodyIdSchema.ts";
import { seriesNumberSchema } from "../../../schema/seriesNumberSchema.ts";

// Tous les médias du backlog de la saga, chacun une fois, chacun avec un numéro différent (règles des séries des jeux)
export const reorderSagaBodySchema = z.object({
	entries: z
		.array(
			z.object({
				userMediaId: bodyIdSchema("User media ID"),
				sagaNumber: seriesNumberSchema("Saga number"),
			}),
			{ message: "Entries should be an array" },
		)
		.min(1, { message: "Entries should contain at least 1 media" })
		.refine(
			(entries) =>
				new Set(entries.map(({ userMediaId }) => userMediaId)).size ===
				entries.length,
			{
				message: "Entries should not contain the same media twice",
				params: { code: ValidationIssueCodeEnum.DUPLICATE_VALUE },
			},
		)
		.refine(
			(entries) =>
				new Set(entries.map(({ sagaNumber }) => sagaNumber)).size ===
				entries.length,
			{
				message: "Entries should not give the same number twice",
				params: { code: ValidationIssueCodeEnum.DUPLICATE_VALUE },
			},
		),
});
