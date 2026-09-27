import { z } from "zod";

export const createErrorLogBodySchema = z.object({
	errorType: z
		.string()
		.trim()
		.min(1, { message: "Error type should contains at least 1 character" })
		.max(100, {
			message: "Error type should contains less than 101 characters",
		}),
	// Colonne TEXT : 65 535 octets, soit 16 383 caractères au pire en utf8mb4 (4 octets par caractère)
	message: z
		.string()
		.trim()
		.min(1, { message: "Message should contains at least 1 character" })
		.max(16383, {
			message: "Message should contains less than 16384 characters",
		}),
	stack: z.string().nullable(),
});
