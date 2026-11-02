// Vrai quand la dernière visite notée date d'au moins `touchMs` : la session est prolongée au plus une fois par période,
// pas à chaque requête (une écriture en base de moins, un cookie renvoyé de moins)
export function isSessionDueForProlongation(
	lastSeenAt: Date,
	now: Date,
	touchMs: number,
): boolean {
	return now.getTime() - lastSeenAt.getTime() >= touchMs;
}
