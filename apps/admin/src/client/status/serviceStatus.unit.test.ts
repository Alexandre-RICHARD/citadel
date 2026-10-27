import { describe, expect, it } from "vitest";

import { serviceStatus } from "./serviceStatus";

describe("serviceStatus.ts", () => {
	describe("running container", () => {
		it.each([
			{ health: "healthy", expected: { tone: "ok", text: "Sain" } },
			{ health: null, expected: { tone: "ok", text: "Allumé" } },
			{ health: "starting", expected: { tone: "warn", text: "Démarrage" } },
			{ health: "unhealthy", expected: { tone: "danger", text: "En échec" } },
		])(
			"SHOULD show $expected.text WHEN its health is $health",
			({ health, expected }) => {
				expect(serviceStatus({ state: "running", health })).toStrictEqual(
					expected,
				);
			},
		);
	});

	describe("other states", () => {
		it.each([
			{ state: "restarting", expected: { tone: "warn", text: "Redémarre" } },
			{ state: "paused", expected: { tone: "warn", text: "En pause" } },
			{ state: "dead", expected: { tone: "danger", text: "Mort" } },
			{ state: "exited", expected: { tone: "idle", text: "Arrêté" } },
		])(
			"SHOULD show $expected.text WHEN the container is $state",
			({ state, expected }) => {
				expect(serviceStatus({ state, health: null })).toStrictEqual(expected);
			},
		);
	});
});
