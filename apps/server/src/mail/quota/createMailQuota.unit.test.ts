import { describe, expect, it, vi } from "vitest";

import { createMailQuota } from "./createMailQuota.ts";
import { MailThresholdEnum } from "./mailThreshold.enum.ts";

const LIMITS = { registrationStop: 3, contactStop: 5, dailyLimit: 7 };
const NOON = Date.parse("2026-11-01T11:00:00Z");
const MINUTE_MS = 60_000;

type Setup = {
	providerCounts?: (number | null | Error)[];
};

// Un compteur simulé : chaque relevé prend la valeur suivante (la dernière se répète), une Error le fait échouer
function createQuota({ providerCounts = [null] }: Setup = {}) {
	let now = NOON;
	let readIndex = 0;
	const readSentToday = vi.fn(() => {
		const value =
			providerCounts[Math.min(readIndex, providerCounts.length - 1)] ?? null;
		readIndex += 1;
		if (value instanceof Error) return Promise.reject(value);
		return Promise.resolve(value);
	});
	const onThresholdCrossed = vi.fn();
	const onReadFailed = vi.fn();
	const quota = createMailQuota({
		limits: LIMITS,
		readingLifetimeMs: MINUTE_MS,
		readSentToday,
		onThresholdCrossed,
		onReadFailed,
		now: () => now,
	});
	return {
		quota,
		readSentToday,
		onThresholdCrossed,
		onReadFailed,
		advance: (ms: number) => {
			now += ms;
		},
	};
}

function recordSends(
	quota: ReturnType<typeof createMailQuota>,
	count: number,
): void {
	for (let index = 0; index < count; index += 1) quota.recordSend();
}

describe("createMailQuota.ts", () => {
	describe("count", () => {
		it("SHOULD take the provider count WHEN the provider answers", async () => {
			const { quota } = createQuota({ providerCounts: [2] });

			expect(await quota.getSentToday()).toBe(2);
		});

		it("SHOULD add its own sends WHEN the reading is less than a minute old", async () => {
			const { quota, readSentToday } = createQuota({ providerCounts: [2] });
			await quota.getSentToday();

			recordSends(quota, 2);

			expect(await quota.getSentToday()).toBe(4);
			expect(readSentToday).toHaveBeenCalledTimes(1);
		});

		it("SHOULD read the provider again WHEN the reading is a minute old", async () => {
			const { quota, advance } = createQuota({ providerCounts: [2, 6] });
			await quota.getSentToday();
			quota.recordSend();

			advance(MINUTE_MS);

			expect(await quota.getSentToday()).toBe(6);
		});

		it("SHOULD count its own sends WHEN there is no provider counter", async () => {
			const { quota } = createQuota();

			recordSends(quota, 3);

			expect(await quota.getSentToday()).toBe(3);
		});

		it("SHOULD keep the last reading plus its own sends WHEN the provider stops answering", async () => {
			const { quota, advance } = createQuota({
				providerCounts: [2, new Error("Brevo down")],
			});
			await quota.getSentToday();
			quota.recordSend();

			advance(MINUTE_MS);

			expect(await quota.getSentToday()).toBe(3);
		});

		it("SHOULD start again from zero WHEN the day changes in Paris without provider", async () => {
			const { quota, advance } = createQuota();
			recordSends(quota, 4);

			// 23 h 30 UTC : 0 h 30 à Paris, le lendemain
			advance(12.5 * 60 * MINUTE_MS);

			expect(await quota.getSentToday()).toBe(0);
		});

		it("SHOULD share one reading WHEN several calls arrive together", async () => {
			const { quota, readSentToday } = createQuota({ providerCounts: [1] });

			await Promise.all([quota.getSentToday(), quota.getSentToday()]);

			expect(readSentToday).toHaveBeenCalledTimes(1);
		});
	});

	describe("status", () => {
		it.each([
			{
				sent: 0,
				status: {
					isRegistrationOpen: true,
					isContactOpen: true,
					isSendingOpen: true,
				},
			},
			{
				sent: 3,
				status: {
					isRegistrationOpen: false,
					isContactOpen: true,
					isSendingOpen: true,
				},
			},
			{
				sent: 5,
				status: {
					isRegistrationOpen: false,
					isContactOpen: false,
					isSendingOpen: true,
				},
			},
			{
				sent: 6,
				status: {
					isRegistrationOpen: false,
					isContactOpen: false,
					isSendingOpen: false,
				},
			},
		])(
			"SHOULD close what the thresholds stop WHEN $sent mails are sent",
			async ({ sent, status }) => {
				const { quota } = createQuota({ providerCounts: [sent] });

				expect(await quota.getStatus()).toStrictEqual(status);
			},
		);
	});

	describe("alerts", () => {
		it("SHOULD signal each threshold once and in order WHEN the sends cross them one by one", async () => {
			const { quota, onThresholdCrossed } = createQuota();

			recordSends(quota, 7);
			await quota.getSentToday();

			expect(onThresholdCrossed.mock.calls).toStrictEqual([
				[MailThresholdEnum.REGISTRATION, 3],
				[MailThresholdEnum.CONTACT, 5],
				[MailThresholdEnum.DAILY, 6],
			]);
		});

		it("SHOULD signal every crossed threshold in order WHEN one reading jumps over them", async () => {
			const { quota, onThresholdCrossed } = createQuota({
				providerCounts: [6],
			});

			await quota.getSentToday();

			expect(onThresholdCrossed.mock.calls).toStrictEqual([
				[MailThresholdEnum.REGISTRATION, 6],
				[MailThresholdEnum.CONTACT, 6],
				[MailThresholdEnum.DAILY, 6],
			]);
		});

		it("SHOULD signal the thresholds again WHEN they are crossed on another day", () => {
			const { quota, onThresholdCrossed, advance } = createQuota();
			recordSends(quota, 3);

			advance(24 * 60 * MINUTE_MS);
			recordSends(quota, 3);

			expect(onThresholdCrossed).toHaveBeenCalledTimes(2);
		});
	});

	describe("provider failures", () => {
		it("SHOULD report a failure once WHEN the provider keeps failing", async () => {
			const { quota, onReadFailed, advance } = createQuota({
				providerCounts: [new Error("Brevo down")],
			});

			await quota.getSentToday();
			advance(MINUTE_MS);
			await quota.getSentToday();

			expect(onReadFailed).toHaveBeenCalledTimes(1);
		});

		it("SHOULD report a new failure WHEN the provider fails again after answering", async () => {
			const failure = new Error("Brevo down");
			const { quota, onReadFailed, advance } = createQuota({
				providerCounts: [failure, 1, failure],
			});

			await quota.getSentToday();
			advance(MINUTE_MS);
			await quota.getSentToday();
			advance(MINUTE_MS);
			await quota.getSentToday();

			expect(onReadFailed).toHaveBeenCalledTimes(2);
		});
	});
});
