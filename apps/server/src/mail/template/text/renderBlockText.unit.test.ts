import { describe, expect, it } from "vitest";

import { MailAccentEnum } from "../mailAccent.enum.ts";
import { renderBlockText } from "./renderBlockText.ts";

describe("renderBlockText.ts", () => {
	describe("text blocks", () => {
		it("SHOULD put the label above the text WHEN the block is a quote", () => {
			expect(
				renderBlockText({
					kind: "quote",
					label: "Message",
					text: "Bonjour,\nÇa va ?",
					isProminent: false,
				}),
			).toBe("Message :\nBonjour,\nÇa va ?");
		});

		it("SHOULD write one line per field WHEN the block is a list of fields", () => {
			expect(
				renderBlockText({
					kind: "fields",
					fields: [
						{ label: "Nom", value: "Sam" },
						{ label: "Email", value: "non donné", isMissing: true },
					],
				}),
			).toBe("Nom : Sam\nEmail : non donné");
		});

		it("SHOULD put the title above the text WHEN the block is a callout", () => {
			expect(
				renderBlockText({
					kind: "callout",
					accent: MailAccentEnum.ORANGE,
					title: "En retard",
					text: "Un incident.",
				}),
			).toBe("En retard\nUn incident.");
		});
	});

	describe("links", () => {
		it("SHOULD follow the label with the address alone WHEN the button opens a new mail", () => {
			expect(
				renderBlockText({
					kind: "button",
					label: "Répondre à Sam",
					href: "mailto:sam%40example.com?subject=Re%3A%20Question",
				}),
			).toBe("Répondre à Sam : sam@example.com");
		});

		it("SHOULD put the site address under the name WHEN the block is a signature", () => {
			expect(
				renderBlockText({
					kind: "signature",
					name: "Alexandre",
					href: "https://alexandre-richard.fr",
				}),
			).toBe("Alexandre\nhttps://alexandre-richard.fr");
		});
	});

	describe("figures", () => {
		it("SHOULD give the value, the maximum and the percentage WHEN the block is a meter", () => {
			expect(
				renderBlockText({
					kind: "meter",
					value: 250,
					max: 300,
					marks: [],
					caption: "mails aujourd'hui",
				}),
			).toBe("250 / 300 mails aujourd'hui (83 %)");
		});

		it("SHOULD write one dashed line per status WHEN the block is a list of statuses", () => {
			expect(
				renderBlockText({
					kind: "statuses",
					statuses: [
						{
							label: "Inscriptions",
							detail: "Ferment à 250 envois",
							state: "Fermées",
							isAlert: true,
						},
					],
				}),
			).toBe("- Inscriptions (Ferment à 250 envois) : Fermées");
		});
	});
});
