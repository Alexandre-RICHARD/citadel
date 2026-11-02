import { describe, expect, it } from "vitest";

import { describeUnsentContactMessages } from "./describeUnsentContactMessages";

describe("describeUnsentContactMessages.ts", () => {
	describe("no alert", () => {
		it.each([{ count: 0 }, { count: null }])(
			"SHOULD give nothing WHEN the count is $count",
			({ count }) => {
				expect(describeUnsentContactMessages(count)).toBeNull();
			},
		);
	});

	describe("alert", () => {
		it("SHOULD speak in the plural WHEN several messages wait", () => {
			expect(describeUnsentContactMessages(2)).toStrictEqual({
				status: "2 messages en attente",
				message:
					"2 messages de contact n'ont pas pu être notifiés et attendent en base (contact_message_unsent) : renvoyés chaque soir à 23 h 50.",
			});
		});

		it("SHOULD speak in the singular WHEN one message waits", () => {
			expect(describeUnsentContactMessages(1)).toStrictEqual({
				status: "1 message en attente",
				message:
					"1 message de contact n'a pas pu être notifié et attend en base (contact_message_unsent) : renvoyé chaque soir à 23 h 50.",
			});
		});
	});
});
