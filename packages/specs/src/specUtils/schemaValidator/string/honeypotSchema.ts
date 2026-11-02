import { z } from "zod";

const HONEYPOT_MAX_LENGTH = 500;

// Champ piège, caché aux humains et toujours vide pour eux : un robot qui le remplit reçoit une réponse normale, et le
// serveur ne fait rien. Rempli, il reste accepté, pour ne rien lui apprendre
export function honeypotSchema(label: string) {
	return z
		.string({ message: `${label} should be a string` })
		.max(HONEYPOT_MAX_LENGTH, {
			message: `${label} should contain at most ${HONEYPOT_MAX_LENGTH} characters`,
		});
}
