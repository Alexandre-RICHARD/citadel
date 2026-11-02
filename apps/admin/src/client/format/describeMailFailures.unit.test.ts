import { describe, expect, it } from "vitest";

import { describeMailFailures } from "./describeMailFailures";
import { formatDateTime } from "./formatDateTime";

const LAST_FAILED_AT = "2026-11-01T14:05:00.000Z";

describe("describeMailFailures.ts", () => {
	describe("no alert", () => {
		it("SHOULD give nothing WHEN no mail failed", () => {
			expect(
				describeMailFailures({ windowDays: 7, count: 0, lastFailedAt: null }),
			).toBeNull();
		});

		it("SHOULD give nothing WHEN the site server did not answer", () => {
			expect(describeMailFailures(null)).toBeNull();
		});
	});

	describe("alert", () => {
		it("SHOULD speak in the plural and date the last failure WHEN several mails failed", () => {
			expect(
				describeMailFailures({
					windowDays: 7,
					count: 3,
					lastFailedAt: LAST_FAILED_AT,
				}),
			).toStrictEqual({
				status: "3 emails non partis",
				message: "3 emails du site n'ont pas pu partir ces 7 derniers jours.",
				detail: `Dernier échec : ${formatDateTime(new Date(LAST_FAILED_AT))}. Détail en base : mailing_failure, error_log.`,
			});
		});

		it("SHOULD speak in the singular WHEN one mail failed", () => {
			expect(
				describeMailFailures({
					windowDays: 7,
					count: 1,
					lastFailedAt: LAST_FAILED_AT,
				}),
			).toMatchObject({
				status: "1 email non parti",
				message: "1 email du site n'a pas pu partir ces 7 derniers jours.",
			});
		});
	});
});
