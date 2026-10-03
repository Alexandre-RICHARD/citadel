import { describe, expect, it } from "vitest";

import { buildFailureMessage } from "./buildFailureMessage";

describe("buildFailureMessage.ts", () => {
	describe("message format", () => {
		it("SHOULD join the action and the reason into one sentence", () => {
			expect(
				buildFailureMessage("charger les jeux", "le serveur est injoignable"),
			).toBe("Impossible de charger les jeux : le serveur est injoignable.");
		});

		it.each([
			{ actionLabel: "ajouter la mort", start: "Impossible d'ajouter" },
			{ actionLabel: "afficher la page", start: "Impossible d'afficher" },
			{ actionLabel: "éditer le jeu", start: "Impossible d'éditer" },
		])(
			"SHOULD elide the preposition WHEN the action starts with a vowel: $actionLabel",
			({ actionLabel, start }) => {
				expect(buildFailureMessage(actionLabel, "raison")).toMatch(
					new RegExp(`^${start} `),
				);
			},
		);
	});
});
