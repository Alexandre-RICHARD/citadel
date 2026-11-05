import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { app } from "../../app.ts";
import { openSignedInAgent } from "../../testUtils/integration/auth/openSignedInAgent.ts";
import { buildUniqueWord } from "../../testUtils/integration/buildUniqueWord.ts";
import { countTableRows } from "../../testUtils/integration/countTableRows.ts";

const GAMES_URL = `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games`;
const SITE_HOST = "citadel.test";
const FOREIGN_ORIGIN = "https://evil.test";

// Les jeux du Game Death Counter servent d'exemple : leurs endpoints exigent une session
let player: Awaited<ReturnType<typeof openSignedInAgent>>;

beforeAll(async () => {
	player = await openSignedInAgent();
});

describe("requireSameOrigin", () => {
	describe("accepted requests", () => {
		it("SHOULD let the request through WHEN its Origin is the host of the site", async () => {
			// Act
			const response = await player.agent
				.post(GAMES_URL)
				.set("Host", SITE_HOST)
				.set("Origin", `https://${SITE_HOST}`)
				.send({ name: buildUniqueWord() });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
		});

		it("SHOULD let the request through WHEN it has no Origin header", async () => {
			// Act
			const response = await player.agent
				.post(GAMES_URL)
				.send({ name: buildUniqueWord() });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
		});

		it("SHOULD let a read through WHEN it comes from another site", async () => {
			// Arrange : une liste vide répondrait 204, quel que soit l'ordre des tests
			await player.agent.post(GAMES_URL).send({ name: buildUniqueWord() });

			// Act
			const response = await player.agent
				.get(GAMES_URL)
				.set("Host", SITE_HOST)
				.set("Origin", FOREIGN_ORIGIN);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
		});
	});

	describe("403 Forbidden", () => {
		it("SHOULD answer FOREIGN_ORIGIN without changing anything WHEN a write comes from another site", async () => {
			// Arrange
			const gameCountBefore = await countTableRows("gdc_game");

			// Act
			const response = await request(app)
				.post(GAMES_URL)
				.set("Host", SITE_HOST)
				.set("Origin", FOREIGN_ORIGIN)
				.send({ name: buildUniqueWord() });

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.FORBIDDEN);
			expect(response.body).toStrictEqual({
				code: TechnicalErrorCodeEnum.FOREIGN_ORIGIN,
				message: "The request comes from a page of another site",
			});
			expect(await countTableRows("gdc_game")).toBe(gameCountBefore);
		});
	});
});
