import { describe, expect, it } from "vitest";

import { buildAuthSettings } from "./buildAuthSettings.ts";
import type { env } from "./env.ts";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const HMAC_KEY = "a".repeat(64);
const ENCRYPTION_KEY = "b".repeat(64);

// Les valeurs de prod de .env.example, seules variables que lit buildAuthSettings
const AUTH_VARIABLES = {
	AUTH_SESSION_REMEMBER_DAYS: 7,
	AUTH_SESSION_IDLE_HOURS: 12,
	AUTH_SESSION_ABSOLUTE_DAYS: 30,
	AUTH_SESSION_TOUCH_MINUTES: 5,
	AUTH_COOKIE_SECURE: true,
	AUTH_REGISTRATION_ENABLED: true,
	AUTH_REGISTRATION_MINUTES: 30,
	AUTH_PASSWORD_RESET_MINUTES: 15,
	AUTH_MAIL_LOGIN_MINUTES: 15,
	AUTH_EMAIL_CHANGE_MINUTES: 30,
	AUTH_SECOND_FACTOR_MINUTES: 10,
	AUTH_CODE_MAX_ATTEMPTS: 5,
	AUTH_MAIL_RESEND_SECONDS: 60,
	AUTH_MAILS_PER_ADDRESS_PER_HOUR: 5,
	AUTH_MAILS_PER_IP_PER_HOUR: 20,
	AUTH_MAILS_PER_IP_PER_DAY: 40,
	AUTH_FAILURE_DELAY_SECONDS: 2,
	AUTH_ACCOUNT_FAILURES_BEFORE_BAN: 15,
	AUTH_ACCOUNT_BAN_MINUTES: 15,
	AUTH_FAILURE_RESET_MINUTES: 15,
	AUTH_IP_FAILURES_BEFORE_BAN: 20,
	AUTH_IP_FAILURE_WINDOW_MINUTES: 10,
	AUTH_IP_BAN_MINUTES: 15,
	AUTH_REGISTRATIONS_PER_IP_PER_HOUR: 3,
	AUTH_USERNAME_CHECKS_PER_IP_PER_HOUR: 60,
	AUTH_ARGON2_MEMORY_KIB: 19_456,
	AUTH_ARGON2_PASSES: 2,
	AUTH_ARGON2_PARALLELISM: 1,
	AUTH_HASH_CONCURRENCY: 2,
	AUTH_HASH_QUEUE_MAX: 20,
	AUTH_TOTP_ISSUER: "Citadel",
	AUTH_TOTP_DRIFT_STEPS: 1,
	AUTH_RECOVERY_CODES_COUNT: 10,
	AUTH_FACTOR_CONFIRMATION_MINUTES: 15,
	AUTH_EVENT_RETENTION_DAYS: 20,
	ERROR_LOG_RETENTION_DAYS: 20,
	AUTH_RESTORE_JOURNAL_DAYS: 70,
	AUTH_RESTORE_JOURNAL_DIR: "/var/lib/citadel/restore-journal",
	AUTH_PURGE_INTERVAL_MINUTES: 15,
	AUTH_CODE_HMAC_KEY: HMAC_KEY,
	AUTH_TOTP_ENCRYPTION_KEY: ENCRYPTION_KEY,
	AUTH_TOTP_ENCRYPTION_KEY_VERSION: 1,
	AUTH_TOTP_PREVIOUS_ENCRYPTION_KEY: "",
} satisfies Partial<typeof env>;

function buildFrom(overrides: Partial<typeof env> = {}) {
	return buildAuthSettings({ ...AUTH_VARIABLES, ...overrides } as typeof env);
}

describe("buildAuthSettings.ts", () => {
	describe("durations", () => {
		it("SHOULD convert every duration to milliseconds WHEN given the production values", () => {
			// Act
			const settings = buildFrom();

			// Assert
			expect(settings.session).toStrictEqual({
				rememberMs: 7 * DAY_MS,
				idleMs: 12 * HOUR_MS,
				absoluteMs: 30 * DAY_MS,
				touchMs: 5 * MINUTE_MS,
			});
			expect(settings.flowDurationMs).toStrictEqual({
				registration: 30 * MINUTE_MS,
				passwordReset: 15 * MINUTE_MS,
				mailLogin: 15 * MINUTE_MS,
				emailChange: 30 * MINUTE_MS,
				secondFactor: 10 * MINUTE_MS,
			});
			expect(settings.code.resendDelayMs).toBe(MINUTE_MS);
			expect(settings.failures).toStrictEqual({
				delayMs: 2000,
				accountFailuresBeforeBan: 15,
				accountBanMs: 15 * MINUTE_MS,
				resetMs: 15 * MINUTE_MS,
				ipFailuresBeforeBan: 20,
				ipWindowMs: 10 * MINUTE_MS,
				ipBanMs: 15 * MINUTE_MS,
			});
			expect(settings.retentionMs).toStrictEqual({
				authEvent: 20 * DAY_MS,
				errorLog: 20 * DAY_MS,
				restoreJournal: 70 * DAY_MS,
			});
			expect(settings.purgeIntervalMs).toBe(15 * MINUTE_MS);
			expect(settings.restoreJournalDirectory).toBe(
				"/var/lib/citadel/restore-journal",
			);
			expect(settings.factorConfirmationMs).toBe(15 * MINUTE_MS);
		});
	});

	describe("password hashing", () => {
		it("SHOULD group the argon2id parameters and the limits WHEN built", () => {
			expect(buildFrom().passwordHashing).toStrictEqual({
				parameters: { memoryKib: 19_456, passes: 2, parallelism: 1 },
				concurrency: 2,
				queueMax: 20,
			});
		});
	});

	describe("TOTP keys", () => {
		it("SHOULD give no previous key WHEN no rotation is in progress", () => {
			expect(buildFrom().totp).toStrictEqual({
				issuer: "Citadel",
				driftSteps: 1,
				encryptionKey: ENCRYPTION_KEY,
				encryptionKeyVersion: 1,
				previousEncryptionKey: null,
			});
		});

		it("SHOULD give the previous key WHEN a rotation is in progress", () => {
			// Act
			const settings = buildFrom({
				AUTH_TOTP_ENCRYPTION_KEY_VERSION: 2,
				AUTH_TOTP_PREVIOUS_ENCRYPTION_KEY: "c".repeat(64),
			});

			// Assert
			expect(settings.totp.previousEncryptionKey).toBe("c".repeat(64));
		});
	});
});
