import type { env } from "./env.ts";

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

// Les réglages de l'authentification, en millisecondes : le code n'a jamais à convertir une durée lui-même
export function buildAuthSettings(variables: typeof env) {
	return {
		session: {
			rememberMs: variables.AUTH_SESSION_REMEMBER_DAYS * DAY_MS,
			idleMs: variables.AUTH_SESSION_IDLE_HOURS * HOUR_MS,
			absoluteMs: variables.AUTH_SESSION_ABSOLUTE_DAYS * DAY_MS,
			touchMs: variables.AUTH_SESSION_TOUCH_MINUTES * MINUTE_MS,
		},
		isCookieSecure: variables.AUTH_COOKIE_SECURE,
		isRegistrationEnabled: variables.AUTH_REGISTRATION_ENABLED,
		flowDurationMs: {
			registration: variables.AUTH_REGISTRATION_MINUTES * MINUTE_MS,
			passwordReset: variables.AUTH_PASSWORD_RESET_MINUTES * MINUTE_MS,
			mailLogin: variables.AUTH_MAIL_LOGIN_MINUTES * MINUTE_MS,
			emailChange: variables.AUTH_EMAIL_CHANGE_MINUTES * MINUTE_MS,
			secondFactor: variables.AUTH_SECOND_FACTOR_MINUTES * MINUTE_MS,
		},
		code: {
			hmacKey: variables.AUTH_CODE_HMAC_KEY,
			maxAttempts: variables.AUTH_CODE_MAX_ATTEMPTS,
			resendDelayMs: variables.AUTH_MAIL_RESEND_SECONDS * SECOND_MS,
		},
		mailLimits: {
			perAddressPerHour: variables.AUTH_MAILS_PER_ADDRESS_PER_HOUR,
			perIpPerHour: variables.AUTH_MAILS_PER_IP_PER_HOUR,
			perIpPerDay: variables.AUTH_MAILS_PER_IP_PER_DAY,
		},
		failures: {
			delayMs: variables.AUTH_FAILURE_DELAY_SECONDS * SECOND_MS,
			accountFailuresBeforeBan: variables.AUTH_ACCOUNT_FAILURES_BEFORE_BAN,
			accountBanMs: variables.AUTH_ACCOUNT_BAN_MINUTES * MINUTE_MS,
			resetMs: variables.AUTH_FAILURE_RESET_MINUTES * MINUTE_MS,
			ipFailuresBeforeBan: variables.AUTH_IP_FAILURES_BEFORE_BAN,
			ipWindowMs: variables.AUTH_IP_FAILURE_WINDOW_MINUTES * MINUTE_MS,
			ipBanMs: variables.AUTH_IP_BAN_MINUTES * MINUTE_MS,
		},
		registrationsPerIpPerHour: variables.AUTH_REGISTRATIONS_PER_IP_PER_HOUR,
		passwordHashing: {
			parameters: {
				memoryKib: variables.AUTH_ARGON2_MEMORY_KIB,
				passes: variables.AUTH_ARGON2_PASSES,
				parallelism: variables.AUTH_ARGON2_PARALLELISM,
			},
			concurrency: variables.AUTH_HASH_CONCURRENCY,
			queueMax: variables.AUTH_HASH_QUEUE_MAX,
		},
		totp: {
			issuer: variables.AUTH_TOTP_ISSUER,
			driftSteps: variables.AUTH_TOTP_DRIFT_STEPS,
			encryptionKey: variables.AUTH_TOTP_ENCRYPTION_KEY,
			encryptionKeyVersion: variables.AUTH_TOTP_ENCRYPTION_KEY_VERSION,
			// Vide hors rotation
			previousEncryptionKey:
				variables.AUTH_TOTP_PREVIOUS_ENCRYPTION_KEY === ""
					? null
					: variables.AUTH_TOTP_PREVIOUS_ENCRYPTION_KEY,
		},
		recoveryCodesCount: variables.AUTH_RECOVERY_CODES_COUNT,
		factorConfirmationMs:
			variables.AUTH_FACTOR_CONFIRMATION_MINUTES * MINUTE_MS,
		retentionMs: {
			authEvent: variables.AUTH_EVENT_RETENTION_DAYS * DAY_MS,
			errorLog: variables.ERROR_LOG_RETENTION_DAYS * DAY_MS,
			restoreJournal: variables.AUTH_RESTORE_JOURNAL_DAYS * DAY_MS,
		},
		purgeIntervalMs: variables.AUTH_PURGE_INTERVAL_MINUTES * MINUTE_MS,
	};
}
