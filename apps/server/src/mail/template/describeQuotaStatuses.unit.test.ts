import { describe, expect, it } from "vitest";

import { MailThresholdEnum } from "../quota/mailThreshold.enum.ts";
import { describeQuotaStatuses } from "./describeQuotaStatuses.ts";

const LIMITS = { registrationStop: 250, contactStop: 280, dailyLimit: 300 };

describe("describeQuotaStatuses.ts", () => {
	describe("states", () => {
		it("SHOULD close the registrations only WHEN the first threshold is crossed", () => {
			const statuses = describeQuotaStatuses(
				MailThresholdEnum.REGISTRATION,
				LIMITS,
			);

			expect(statuses.map(({ state }) => state)).toStrictEqual([
				"Fermées",
				"Ouvert",
				"Actifs",
			]);
			expect(statuses.map(({ isAlert }) => isAlert)).toStrictEqual([
				true,
				false,
				false,
			]);
		});

		it("SHOULD close everything WHEN the daily threshold is crossed", () => {
			const statuses = describeQuotaStatuses(MailThresholdEnum.DAILY, LIMITS);

			expect(statuses.every(({ isAlert }) => isAlert)).toBe(true);
		});
	});

	describe("details", () => {
		it("SHOULD give the limit of each feature", () => {
			const statuses = describeQuotaStatuses(MailThresholdEnum.CONTACT, LIMITS);

			expect(statuses.map(({ detail }) => detail)).toStrictEqual([
				"Ferment à 250 envois",
				"Ferme à 280 envois",
				"Plafond de Brevo : 300 envois",
			]);
		});
	});
});
