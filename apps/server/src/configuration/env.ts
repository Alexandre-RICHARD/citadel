import { z } from "zod";

import { MailSenderKindEnum } from "../mail/sender/mailSenderKind.enum.ts";

// Un nombre entier strictement positif (durée, seuil), avec sa valeur de prod
function positiveInteger(defaultValue: number) {
	return z.coerce.number().int().positive().default(defaultValue);
}

function booleanFlag(defaultValue: boolean) {
	return z
		.enum(["true", "false"])
		.default(defaultValue ? "true" : "false")
		.transform((flag) => flag === "true");
}

// 32 octets en hexadécimal : `openssl rand -hex 32` (Git Bash)
const HEX_KEY_32_BYTES = /^[0-9a-f]{64}$/;
const HEX_KEY_MESSAGE =
	"64 hexadecimal characters expected (openssl rand -hex 32)";

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

	// ----- Authentification (lues par authSettings seulement) -----
	// Sessions : 7 jours sans visite avec « se souvenir de moi », 12 h d'inactivité sans, 30 jours au plus ; la date de
	// dernière visite est mise à jour au plus toutes les 5 minutes
	AUTH_SESSION_REMEMBER_DAYS: positiveInteger(7),
	AUTH_SESSION_IDLE_HOURS: positiveInteger(12),
	AUTH_SESSION_ABSOLUTE_DAYS: positiveInteger(30),
	AUTH_SESSION_TOUCH_MINUTES: positiveInteger(5),
	// false en dev seulement (http://localhost) : le cookie perd alors Secure et son préfixe __Host-
	AUTH_COOKIE_SECURE: booleanFlag(true),
	// Interrupteur d'urgence des inscriptions
	AUTH_REGISTRATION_ENABLED: booleanFlag(true),
	// Durées des parcours en plusieurs étapes
	AUTH_REGISTRATION_MINUTES: positiveInteger(30),
	AUTH_PASSWORD_RESET_MINUTES: positiveInteger(15),
	AUTH_MAIL_LOGIN_MINUTES: positiveInteger(15),
	AUTH_EMAIL_CHANGE_MINUTES: positiveInteger(30),
	AUTH_SECOND_FACTOR_MINUTES: positiveInteger(10),
	// Codes reçus par mail : essais par code, délai avant un renvoi
	AUTH_CODE_MAX_ATTEMPTS: positiveInteger(5),
	AUTH_MAIL_RESEND_SECONDS: positiveInteger(60),
	// Mails de l'authentification, par adresse et par IP
	AUTH_MAILS_PER_ADDRESS_PER_HOUR: positiveInteger(5),
	AUTH_MAILS_PER_IP_PER_HOUR: positiveInteger(20),
	AUTH_MAILS_PER_IP_PER_DAY: positiveInteger(40),
	// Échecs de connexion : délai entre deux essais sur un compte, bannissement du couple compte + IP, remise à zéro
	AUTH_FAILURE_DELAY_SECONDS: positiveInteger(2),
	AUTH_ACCOUNT_FAILURES_BEFORE_BAN: positiveInteger(15),
	AUTH_ACCOUNT_BAN_MINUTES: positiveInteger(15),
	AUTH_FAILURE_RESET_MINUTES: positiveInteger(15),
	// Bannissement d'une IP : trop d'échecs sur une fenêtre, ou trop d'inscriptions par heure
	AUTH_IP_FAILURES_BEFORE_BAN: positiveInteger(20),
	AUTH_IP_FAILURE_WINDOW_MINUTES: positiveInteger(10),
	AUTH_IP_BAN_MINUTES: positiveInteger(15),
	AUTH_REGISTRATIONS_PER_IP_PER_HOUR: positiveInteger(3),
	// Coût d'un hash de mot de passe (minimum OWASP), et hashs simultanés puis en attente au plus
	AUTH_ARGON2_MEMORY_KIB: positiveInteger(19_456),
	AUTH_ARGON2_PASSES: positiveInteger(2),
	AUTH_ARGON2_PARALLELISM: positiveInteger(1),
	AUTH_HASH_CONCURRENCY: positiveInteger(2),
	AUTH_HASH_QUEUE_MAX: positiveInteger(20),
	// Double authentification : émetteur affiché par l'application, pas de 30 s tolérés avant et après
	AUTH_TOTP_ISSUER: z.string().min(1).default("Citadel"),
	AUTH_TOTP_DRIFT_STEPS: z.coerce.number().int().nonnegative().default(1),
	AUTH_RECOVERY_CODES_COUNT: positiveInteger(10),
	// Un facteur ajouté dont le premier code n'est pas validé dans ce délai est effacé par la purge
	AUTH_FACTOR_CONFIRMATION_MINUTES: positiveInteger(15),
	// Conservation : événements de sécurité et erreurs du serveur, journal de restauration
	AUTH_EVENT_RETENTION_DAYS: positiveInteger(20),
	ERROR_LOG_RETENTION_DAYS: positiveInteger(20),
	AUTH_RESTORE_JOURNAL_DAYS: positiveInteger(70),
	// Intervalle de la purge des parcours, des sessions et des facteurs non confirmés expirés
	AUTH_PURGE_INTERVAL_MINUTES: positiveInteger(15),
	// [secret] Clé des empreintes HMAC des codes reçus par mail
	AUTH_CODE_HMAC_KEY: z.string().regex(HEX_KEY_32_BYTES, HEX_KEY_MESSAGE),
	// [secret] Clé AES-256-GCM des secrets TOTP, et sa version (enregistrée avec chaque secret chiffré)
	AUTH_TOTP_ENCRYPTION_KEY: z.string().regex(HEX_KEY_32_BYTES, HEX_KEY_MESSAGE),
	AUTH_TOTP_ENCRYPTION_KEY_VERSION: z.coerce.number().int().min(1).max(255),
	// [secret] Pendant une rotation seulement : la clé d'avant (version précédente), sinon vide
	AUTH_TOTP_PREVIOUS_ENCRYPTION_KEY: z
		.union([z.literal(""), z.string().regex(HEX_KEY_32_BYTES, HEX_KEY_MESSAGE)])
		.default(""),
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
	)
	// Argon2 refuse moins de 8 Kio par fil de calcul
	.refine(
		(variables) =>
			variables.AUTH_ARGON2_MEMORY_KIB >= 8 * variables.AUTH_ARGON2_PARALLELISM,
		{
			message: "at least 8 KiB per thread (AUTH_ARGON2_PARALLELISM) expected",
			path: ["AUTH_ARGON2_MEMORY_KIB"],
		},
	)
	// La clé d'avant déchiffre les secrets de la version précédente : elle n'existe qu'à partir de la version 2
	.refine(
		(variables) =>
			variables.AUTH_TOTP_PREVIOUS_ENCRYPTION_KEY === "" ||
			(variables.AUTH_TOTP_ENCRYPTION_KEY_VERSION >= 2 &&
				variables.AUTH_TOTP_PREVIOUS_ENCRYPTION_KEY !==
					variables.AUTH_TOTP_ENCRYPTION_KEY),
		{
			message:
				"a different key, with AUTH_TOTP_ENCRYPTION_KEY_VERSION of 2 or more, expected",
			path: ["AUTH_TOTP_PREVIOUS_ENCRYPTION_KEY"],
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
