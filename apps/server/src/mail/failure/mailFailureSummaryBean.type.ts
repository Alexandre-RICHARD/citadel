export type MailFailureSummaryBean = {
	windowDays: number;
	count: number;
	lastFailedAt: Date | null;
};
