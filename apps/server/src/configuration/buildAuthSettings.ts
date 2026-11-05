import { DurationMsEnum } from "@citadel/common/src/universal/date/durationMs.enum.ts";

import type { env } from "./env.ts";

// Les réglages de l'authentification, en millisecondes : le code n'a jamais à convertir une durée lui-même
export function buildAuthSettings(variables: typeof env) {
	return {
		session: {
			rememberMs: variables.AUTH_SESSION_REMEMBER_DAYS * DurationMsEnum.DAY,
			idleMs: variables.AUTH_SESSION_IDLE_HOURS * DurationMsEnum.HOUR,
			absoluteMs: variables.AUTH_SESSION_ABSOLUTE_DAYS * DurationMsEnum.DAY,
			touchMs: variables.AUTH_SESSION_TOUCH_MINUTES * DurationMsEnum.MINUTE,
		},
		isCookieSecure: variables.AUTH_COOKIE_SECURE,
		isRegistrationEnabled: variables.AUTH_REGISTRATION_ENABLED,
		flowDurationMs: {
			registration: variables.AUTH_REGISTRATION_MINUTES * DurationMsEnum.MINUTE,
			passwordReset:
				variables.AUTH_PASSWORD_RESET_MINUTES * DurationMsEnum.MINUTE,
			mailLogin: variables.AUTH_MAIL_LOGIN_MINUTES * DurationMsEnum.MINUTE,
			emailChange: variables.AUTH_EMAIL_CHANGE_MINUTES * DurationMsEnum.MINUTE,
			secondFactor:
				variables.AUTH_SECOND_FACTOR_MINUTES * DurationMsEnum.MINUTE,
		},
		code: {
			hmacKey: variables.AUTH_CODE_HMAC_KEY,
			maxAttempts: variables.AUTH_CODE_MAX_ATTEMPTS,
			resendDelayMs: variables.AUTH_MAIL_RESEND_SECONDS * DurationMsEnum.SECOND,
		},
		mailLimits: {
			perAddressPerHour: variables.AUTH_MAILS_PER_ADDRESS_PER_HOUR,
			perIpPerHour: variables.AUTH_MAILS_PER_IP_PER_HOUR,
			perIpPerDay: variables.AUTH_MAILS_PER_IP_PER_DAY,
		},
		failures: {
			delayMs: variables.AUTH_FAILURE_DELAY_SECONDS * DurationMsEnum.SECOND,
			accountFailuresBeforeBan: variables.AUTH_ACCOUNT_FAILURES_BEFORE_BAN,
			accountBanMs: variables.AUTH_ACCOUNT_BAN_MINUTES * DurationMsEnum.MINUTE,
			resetMs: variables.AUTH_FAILURE_RESET_MINUTES * DurationMsEnum.MINUTE,
			ipFailuresBeforeBan: variables.AUTH_IP_FAILURES_BEFORE_BAN,
			ipWindowMs:
				variables.AUTH_IP_FAILURE_WINDOW_MINUTES * DurationMsEnum.MINUTE,
			ipBanMs: variables.AUTH_IP_BAN_MINUTES * DurationMsEnum.MINUTE,
		},
		registrationsPerIpPerHour: variables.AUTH_REGISTRATIONS_PER_IP_PER_HOUR,
		usernameChecksPerIpPerHour: variables.AUTH_USERNAME_CHECKS_PER_IP_PER_HOUR,
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
			variables.AUTH_FACTOR_CONFIRMATION_MINUTES * DurationMsEnum.MINUTE,
		retentionMs: {
			authEvent: variables.AUTH_EVENT_RETENTION_DAYS * DurationMsEnum.DAY,
			errorLog: variables.ERROR_LOG_RETENTION_DAYS * DurationMsEnum.DAY,
			restoreJournal: variables.AUTH_RESTORE_JOURNAL_DAYS * DurationMsEnum.DAY,
		},
		restoreJournalDirectory: variables.AUTH_RESTORE_JOURNAL_DIR,
		purgeIntervalMs:
			variables.AUTH_PURGE_INTERVAL_MINUTES * DurationMsEnum.MINUTE,
	};
}
