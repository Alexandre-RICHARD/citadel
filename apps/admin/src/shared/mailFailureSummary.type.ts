// Les emails du site qui n'ont pas pu partir ces derniers jours : la réponse de /internal/mail/failures du serveur du
// site (MailFailureSummaryDto, dans les specs)
export type MailFailureSummary = {
	windowDays: number;
	count: number;
	// ISO 8601 ; null : aucun échec dans la fenêtre
	lastFailedAt: string | null;
};
