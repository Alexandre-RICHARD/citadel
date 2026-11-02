// Les mails qui n'ont pas pu partir ces derniers jours, pour l'alerte de la console du NAS
export type MailFailureSummaryDto = {
	// Taille de la fenêtre comptée, en jours
	windowDays: number;
	count: number;
	// ISO 8601 ; null : aucun échec dans la fenêtre
	lastFailedAt: string | null;
};
