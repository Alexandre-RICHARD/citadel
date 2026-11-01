// Les seuils de env.ts, en mails envoyés dans la journée
export type MailQuotaLimits = {
	registrationStop: number;
	contactStop: number;
	dailyLimit: number;
};
