import { ContactAcknowledgementEnum } from "@citadel/specs/src/projects/contact/contactAcknowledgement.enum";
import { describe, expect, it } from "vitest";

import { describeAcknowledgement } from "./describeAcknowledgement";

const EMAIL = "sam@example.com";

describe("describeAcknowledgement.ts", () => {
	describe("line", () => {
		it.each([
			{
				acknowledgement: ContactAcknowledgementEnum.SENT,
				email: EMAIL,
				line: "Un accusé de réception est parti vers sam@example.com.",
			},
			{
				acknowledgement: ContactAcknowledgementEnum.ALREADY_SENT_TODAY,
				email: EMAIL,
				line: "sam@example.com a déjà reçu un accusé de réception aujourd’hui : pas de nouveau pour ce message.",
			},
			{
				acknowledgement: ContactAcknowledgementEnum.FAILED,
				email: EMAIL,
				line: "L’accusé de réception n’a pas pu partir vers sam@example.com, mais je vous répondrai bien à cette adresse email.",
			},
			{
				acknowledgement: ContactAcknowledgementEnum.NO_EMAIL,
				email: null,
				line: "Sans adresse email, je ne pourrai pas vous répondre.",
			},
		])(
			"SHOULD tell what became of the acknowledgement WHEN it is $acknowledgement",
			({ acknowledgement, email, line }) => {
				expect(describeAcknowledgement(acknowledgement, email)).toBe(line);
			},
		);
	});
});
