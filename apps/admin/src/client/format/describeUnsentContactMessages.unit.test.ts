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
				status: "2 messages à lire",
				message:
					"2 messages de contact n'ont pas pu être notifiés et attendent en base (contact_message_unsent). À supprimer une fois lus.",
			});
		});

		it("SHOULD speak in the singular WHEN one message waits", () => {
			expect(describeUnsentContactMessages(1)).toStrictEqual({
				status: "1 message à lire",
				message:
					"1 message de contact n'a pas pu être notifié et attend en base (contact_message_unsent). À supprimer une fois lu.",
			});
		});
	});
});
