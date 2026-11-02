import { z } from "zod";

import { MailSenderKindEnum } from "../mail/sender/mailSenderKind.enum.ts";

const envSchema = z.object({
	SERVER_PORT: z.coerce.number().int().positive(),
	// Gravée dans l'image Docker à sa construction (tag git, v2026.10.25) ; "dev" en local
	APP_VERSION: z.string().min(1).default("dev"),

	DB_HOST: z.string().min(1),
	DB_PORT: z.coerce.number().int().positive(),
	DB_USER_NAME: z.string().min(1),
	DB_USER_PASSWORD: z.string(),
	DB_DATABASE_NAME: z.string().min(1),

	// Application Twitch du Backlog (dev.twitch.tv) : le serveur en tire lui-même ses tokens IGDB, renouvelés au besoin
	INTERNET_GAME_DATA_BASE_CLIENT_ID: z.string().min(1),
	INTERNET_GAME_DATA_BASE_CLIENT_SECRET: z.string().min(1),

	LOG_DB: z
		.enum(["true", "false"])
		.default("false")
		.transform((logDb) => logDb === "true"),

	// ----- Mails -----
	// Qui envoie : brevo (la prod) ; journal (une ligne dans le log, sans contenu : dev, pré-prod) ; memory (tests)
	MAIL_SENDER: z.enum(MailSenderKindEnum).default(MailSenderKindEnum.JOURNAL),
	BREVO_API_KEY: z.string().default(""),
	// Seuils du quota quotidien de Brevo, en mails envoyés dans la journée : les inscriptions, puis le formulaire
	// de contact, puis tout le reste s'arrêtent
	MAIL_REGISTRATION_STOP: z.coerce.number().int().positive().default(250),
	MAIL_CONTACT_STOP: z.coerce.number().int().positive().default(280),
	MAIL_DAILY_LIMIT: z.coerce.number().int().positive().default(300),
	// Messages du formulaire de contact par heure et par IP
	CONTACT_HOURLY_LIMIT_PER_IP: z.coerce.number().int().positive().default(5),
	// Crédits quotidiens de l'offre de Brevo (300 sur l'offre gratuite) : Brevo ne donne que ce qu'il en reste
	BREVO_DAILY_CREDITS: z.coerce.number().int().positive().default(300),
	// Le compteur de Brevo est relu au plus une fois par cette durée
	MAIL_QUOTA_READING_SECONDS: z.coerce.number().int().positive().default(60),
	// Un échec d'envoi (mailing_failure) est effacé après cette durée
	MAIL_FAILURE_RETENTION_DAYS: z.coerce.number().int().positive().default(90),
	// Les échecs des derniers jours, résumés pour la console du NAS
	MAIL_FAILURE_WINDOW_DAYS: z.coerce.number().int().positive().default(7),
});

// Les règles entre variables, une fois chacune valide
const envRulesSchema = envSchema
	.refine(
		(variables) =>
			variables.MAIL_SENDER !== MailSenderKindEnum.BREVO ||
			variables.BREVO_API_KEY !== "",
		{
			message: "required when MAIL_SENDER is brevo",
			path: ["BREVO_API_KEY"],
		},
	)
	.refine(
		(variables) =>
			variables.MAIL_REGISTRATION_STOP <= variables.MAIL_CONTACT_STOP &&
			variables.MAIL_CONTACT_STOP <= variables.MAIL_DAILY_LIMIT,
		{
			message:
				"MAIL_REGISTRATION_STOP <= MAIL_CONTACT_STOP <= MAIL_DAILY_LIMIT expected",
			path: ["MAIL_CONTACT_STOP"],
		},
	);

function parseEnv(): z.infer<typeof envRulesSchema> {
	const result = envRulesSchema.safeParse(process.env);

	if (!result.success) {
		const invalidVariables = result.error.issues
			.map((issue) => `  - ${issue.path.join(".")} : ${issue.message}`)
			.join("\n");
		console.error(
			`Variables d'environnement invalides (voir .env.example) :\n${invalidVariables}`,
		);
		process.exit(1);
	}

	return result.data;
}

export const env = parseEnv();
