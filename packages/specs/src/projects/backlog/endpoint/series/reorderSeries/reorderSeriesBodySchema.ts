import { z } from "zod";

import { ValidationIssueCodeEnum } from "../../../../../specUtils/error/validationIssueCode.enum.ts";
import { bodyIdSchema } from "../../../../../specUtils/schemaValidator/id/bodyIdSchema.ts";
import { seriesNumberSchema } from "../../../schema/seriesNumberSchema.ts";

// Tous les jeux du backlog de la série, chacun une fois, chacun avec un numéro différent
export const reorderSeriesBodySchema = z.object({
	entries: z
		.array(
			z.object({
				gameId: bodyIdSchema("Game ID"),
				seriesNumber: seriesNumberSchema("Series number"),
			}),
			{ message: "Entries should be an array" },
		)
		.min(1, { message: "Entries should contain at least 1 game" })
		.refine(
			(entries) =>
				new Set(entries.map(({ gameId }) => gameId)).size === entries.length,
			{
				message: "Entries should not contain the same game twice",
				params: { code: ValidationIssueCodeEnum.DUPLICATE_VALUE },
			},
		)
		.refine(
			(entries) =>
				new Set(entries.map(({ seriesNumber }) => seriesNumber)).size ===
				entries.length,
			{
				message: "Entries should not give the same number twice",
				params: { code: ValidationIssueCodeEnum.DUPLICATE_VALUE },
			},
		),
});
