import { describe, expect, it } from "vitest";

import { buildFailureMessage } from "./buildFailureMessage";

describe("buildFailureMessage.ts", () => {
	describe("message format", () => {
		it("SHOULD join the action and the reason into one sentence", () => {
			expect(
				buildFailureMessage("charger les jeux", "le serveur est injoignable"),
			).toBe("Impossible de charger les jeux : le serveur est injoignable.");
		});
	});
});
