import { describe, expect, it } from "vitest";

import { createAuthLimiter } from "./createAuthLimiter.ts";

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

// Les valeurs de prod de .env.example
const SETTINGS = {
	failures: {
		delayMs: 2 * SECOND_MS,
		accountFailuresBeforeBan: 15,
		accountBanMs: 15 * MINUTE_MS,
		resetMs: 15 * MINUTE_MS,
		ipFailuresBeforeBan: 20,
		ipWindowMs: 10 * MINUTE_MS,
		ipBanMs: 15 * MINUTE_MS,
	},
	mailLimits: { perAddressPerHour: 5, perIpPerHour: 20, perIpPerDay: 40 },
	registrationsPerIpPerHour: 3,
};

const ALEX = { accountKey: "12", ip: "203.0.113.1" };
const ALEX_FROM_PHONE = { accountKey: "12", ip: "198.51.100.7" };

type Attempt = typeof ALEX;

function createLimiter() {
	let currentTime = 0;
	const limiter = createAuthLimiter(SETTINGS, () => currentTime);
	return {
		limiter,
		advance: (milliseconds: number): void => {
			currentTime += milliseconds;
		},
	};
}

// Des échecs espacés de 2 s, le délai entre deux essais
function failRepeatedly(
	{ limiter, advance }: ReturnType<typeof createLimiter>,
	attempt: Attempt,
	count: number,
): void {
	for (let index = 0; index < count; index++) {
		limiter.recordFailure(attempt);
		advance(2 * SECOND_MS);
	}
}

// Un échec sur chacun de `count` comptes différents, depuis l'IP donnée par `ipOf`
function failOnManyAccounts(
	{ limiter, advance }: ReturnType<typeof createLimiter>,
	count: number,
	ipOf: (index: number) => string,
	spacingMs = 0,
): void {
	for (let index = 0; index < count; index++) {
		limiter.recordFailure({ accountKey: `account-${index}`, ip: ipOf(index) });
		advance(spacingMs);
	}
}

function claimMails(
	{ limiter }: ReturnType<typeof createLimiter>,
	count: number,
	requestOf: (index: number) => { email: string; ip: string },
): void {
	for (let index = 0; index < count; index++)
		limiter.claimMail(requestOf(index));
}

describe("createAuthLimiter.ts", () => {
	describe("delay between attempts", () => {
		it("SHOULD accept the attempt WHEN the account never failed", () => {
			expect(createLimiter().limiter.getAttemptRetryAfterMs(ALEX)).toBeNull();
		});

		it("SHOULD make the account wait 2 seconds from this IP WHEN an attempt failed", () => {
			// Arrange
			const { limiter } = createLimiter();

			// Act
			limiter.recordFailure(ALEX);

			// Assert
			expect(limiter.getAttemptRetryAfterMs(ALEX)).toBe(2 * SECOND_MS);
		});

		it("SHOULD leave the account open from another IP WHEN a stranger keeps failing on it", () => {
			// Arrange
			const { limiter } = createLimiter();

			// Act
			limiter.recordFailure(ALEX);

			// Assert
			expect(limiter.getAttemptRetryAfterMs(ALEX_FROM_PHONE)).toBeNull();
		});

		it("SHOULD accept the attempt WHEN the 2 seconds are over", () => {
			// Arrange
			const clock = createLimiter();
			clock.limiter.recordFailure(ALEX);

			// Act
			clock.advance(2 * SECOND_MS);

			// Assert
			expect(clock.limiter.getAttemptRetryAfterMs(ALEX)).toBeNull();
		});
	});

	describe("account and IP ban", () => {
		it("SHOULD ban the account from this IP for 15 minutes WHEN it failed 15 times", () => {
			// Arrange
			const clock = createLimiter();

			// Act
			failRepeatedly(clock, ALEX, 15);

			// Assert : le dernier échec date de 2 s
			expect(clock.limiter.getAttemptRetryAfterMs(ALEX)).toBe(
				15 * MINUTE_MS - 2 * SECOND_MS,
			);
		});

		it("SHOULD not ban the account WHEN it failed 14 times", () => {
			// Arrange
			const clock = createLimiter();

			// Act
			failRepeatedly(clock, ALEX, 14);

			// Assert
			expect(clock.limiter.getAttemptRetryAfterMs(ALEX)).toBeNull();
		});

		it("SHOULD leave the account open from another IP WHEN it is banned from one", () => {
			// Arrange
			const clock = createLimiter();

			// Act
			failRepeatedly(clock, ALEX, 15);

			// Assert
			expect(clock.limiter.getAttemptRetryAfterMs(ALEX_FROM_PHONE)).toBeNull();
		});

		it("SHOULD accept the account again WHEN the 15 minutes are over", () => {
			// Arrange
			const clock = createLimiter();
			failRepeatedly(clock, ALEX, 15);

			// Act
			clock.advance(15 * MINUTE_MS);

			// Assert
			expect(clock.limiter.getAttemptRetryAfterMs(ALEX)).toBeNull();
		});

		it("SHOULD start counting again WHEN a login succeeded", () => {
			// Arrange
			const clock = createLimiter();
			failRepeatedly(clock, ALEX, 14);
			clock.limiter.recordSuccess(ALEX);
			// Moins que le calme de 15 minutes, assez pour vider la fenêtre de l'IP (20 échecs en 10 minutes)
			clock.advance(10 * MINUTE_MS);

			// Act
			failRepeatedly(clock, ALEX, 14);

			// Assert
			expect(clock.limiter.getAttemptRetryAfterMs(ALEX)).toBeNull();
		});

		it("SHOULD start counting again WHEN the account stayed calm 15 minutes", () => {
			// Arrange
			const clock = createLimiter();
			failRepeatedly(clock, ALEX, 14);
			clock.advance(15 * MINUTE_MS);

			// Act
			failRepeatedly(clock, ALEX, 14);

			// Assert
			expect(clock.limiter.getAttemptRetryAfterMs(ALEX)).toBeNull();
		});

		it("SHOULD share the ban WHEN two IPv6 of the same /64 attack the account", () => {
			// Arrange
			const clock = createLimiter();
			failRepeatedly(clock, { accountKey: "12", ip: "2001:db8:1:2::1" }, 15);

			// Act
			const retryAfterMs = clock.limiter.getAttemptRetryAfterMs({
				accountKey: "12",
				ip: "2001:db8:1:2::abcd",
			});

			// Assert
			expect(retryAfterMs).not.toBeNull();
		});
	});

	describe("IP ban", () => {
		it("SHOULD ban the IP for 15 minutes on every account WHEN it failed 20 times in 10 minutes", () => {
			// Arrange
			const clock = createLimiter();
			failOnManyAccounts(clock, 20, () => ALEX.ip);

			// Act
			const retryAfterMs = clock.limiter.getAttemptRetryAfterMs({
				accountKey: "another-account",
				ip: ALEX.ip,
			});

			// Assert
			expect(retryAfterMs).toBe(15 * MINUTE_MS);
		});

		it("SHOULD not ban the IP WHEN its 20 failures are spread over more than 10 minutes", () => {
			// Arrange
			const clock = createLimiter();
			failOnManyAccounts(clock, 20, () => ALEX.ip, MINUTE_MS);

			// Act
			const retryAfterMs = clock.limiter.getAttemptRetryAfterMs({
				accountKey: "another-account",
				ip: ALEX.ip,
			});

			// Assert
			expect(retryAfterMs).toBeNull();
		});

		it("SHOULD count the IPv6 of a /64 together WHEN they fail on several accounts", () => {
			// Arrange
			const clock = createLimiter();
			failOnManyAccounts(clock, 20, (index) => `2001:db8:1:2::${index + 1}`);

			// Act
			const retryAfterMs = clock.limiter.getAttemptRetryAfterMs({
				accountKey: "another-account",
				ip: "2001:db8:1:2::ffff",
			});

			// Assert
			expect(retryAfterMs).toBe(15 * MINUTE_MS);
		});
	});

	describe("registrations", () => {
		it("SHOULD accept 3 registrations an hour WHEN they come from one IP", () => {
			// Arrange
			const { limiter } = createLimiter();

			// Act
			const retryAfterList = [1, 2, 3].map(() =>
				limiter.claimRegistration(ALEX.ip),
			);

			// Assert
			expect(retryAfterList).toStrictEqual([null, null, null]);
		});

		it("SHOULD ban the IP for 15 minutes, logins included, WHEN a 4th registration comes within the hour", () => {
			// Arrange
			const { limiter } = createLimiter();
			[1, 2, 3].forEach(() => limiter.claimRegistration(ALEX.ip));

			// Act
			const retryAfterMs = limiter.claimRegistration(ALEX.ip);

			// Assert
			expect(retryAfterMs).toBe(15 * MINUTE_MS);
			expect(limiter.getAttemptRetryAfterMs(ALEX)).toBe(15 * MINUTE_MS);
		});

		it("SHOULD accept registrations again WHEN the ban is over", () => {
			// Arrange
			const clock = createLimiter();
			[1, 2, 3, 4].forEach(() => clock.limiter.claimRegistration(ALEX.ip));

			// Act
			clock.advance(15 * MINUTE_MS);

			// Assert
			expect(clock.limiter.claimRegistration(ALEX.ip)).toBeNull();
		});
	});

	describe("mails", () => {
		it("SHOULD refuse a 6th mail an hour WHEN it goes to the same address, whatever its case", () => {
			// Arrange
			const clock = createLimiter();
			claimMails(clock, 5, (index) => ({
				email: "alex@example.com",
				ip: `203.0.113.${index}`,
			}));

			// Act
			const retryAfterMs = clock.limiter.claimMail({
				email: "Alex@Example.com",
				ip: "198.51.100.1",
			});

			// Assert
			expect(retryAfterMs).toBe(HOUR_MS);
		});

		it("SHOULD refuse a 21st mail an hour WHEN they come from one IP", () => {
			// Arrange
			const clock = createLimiter();
			claimMails(clock, 20, (index) => ({
				email: `user${index}@example.com`,
				ip: ALEX.ip,
			}));

			// Act
			const retryAfterMs = clock.limiter.claimMail({
				email: "other@example.com",
				ip: ALEX.ip,
			});

			// Assert
			expect(retryAfterMs).toBe(HOUR_MS);
		});

		it("SHOULD refuse a 41st mail a day WHEN one IP sends 20 every hour", () => {
			// Arrange
			const clock = createLimiter();
			claimMails(clock, 20, (index) => ({
				email: `first${index}@example.com`,
				ip: ALEX.ip,
			}));
			clock.advance(HOUR_MS);
			claimMails(clock, 20, (index) => ({
				email: `second${index}@example.com`,
				ip: ALEX.ip,
			}));
			clock.advance(HOUR_MS);

			// Act
			const retryAfterMs = clock.limiter.claimMail({
				email: "other@example.com",
				ip: ALEX.ip,
			});

			// Assert : les premiers mails du jour sortent de la fenêtre 22 h plus tard
			expect(retryAfterMs).toBe(DAY_MS - 2 * HOUR_MS);
		});

		it("SHOULD count nothing WHEN a mail is refused", () => {
			// Arrange : l'adresse est pleine depuis une autre IP, puis refusée 10 fois depuis celle-ci
			const clock = createLimiter();
			claimMails(clock, 5, () => ({
				email: "alex@example.com",
				ip: "198.51.100.1",
			}));
			claimMails(clock, 10, () => ({
				email: "alex@example.com",
				ip: ALEX.ip,
			}));

			// Act : 20 autres adresses passent encore depuis cette IP
			const retryAfterList = Array.from({ length: 20 }, (_, index) =>
				clock.limiter.claimMail({
					email: `user${index}@example.com`,
					ip: ALEX.ip,
				}),
			);

			// Assert
			expect(new Set(retryAfterList)).toStrictEqual(new Set([null]));
		});
	});
});
