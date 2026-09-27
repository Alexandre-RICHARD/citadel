import { z } from "zod";

export const updateDeathBodySchema = z
	.object({
		date: z.iso
			.datetime({
				offset: true,
				message: "Date should be an ISO 8601 datetime",
				abort: true,
			})
			.refine((date) => new Date(date).getTime() <= Date.now(), {
				message: "Date should not be in the future",
			})
			.optional(),
		comment: z
			.string()
			.trim()
			.max(1000, {
				message: "Comment should contains maximum 1000 characters",
			})
			.transform((comment) => (comment === "" ? null : comment))
			.nullable()
			.optional(),
	})
	.refine((body) => body.date !== undefined || body.comment !== undefined, {
		message: "At least one of date or comment should be provided",
	});
