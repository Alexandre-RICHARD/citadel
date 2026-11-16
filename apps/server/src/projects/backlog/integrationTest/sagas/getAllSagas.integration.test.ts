import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { insertMediaRows } from "../../../../testUtils/integration/backlog/insertMediaRows.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";

const SAGAS_URL = `${ApiPrefixEnum.BACKLOG}/sagas`;

describe("getAllSagas", () => {
	describe("200 OK", () => {
		it("SHOULD give the sagas of the account by name, and none of another account", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const stranger = await openSignedInAgent();
			const starWarsId = await insertMediaRows.saga({
				userId: account.userId,
				name: "Star Wars",
			});
			const alienId = await insertMediaRows.saga({
				userId: account.userId,
				name: "Alien",
			});
			await insertMediaRows.saga({ userId: stranger.userId, name: "Batman" });

			// Act
			const response = await account.agent.get(SAGAS_URL);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toStrictEqual([
				{ id: alienId, name: "Alien" },
				{ id: starWarsId, name: "Star Wars" },
			]);
		});
	});

	describe("204 No Content", () => {
		it("SHOULD answer with no content WHEN the account has no saga", async () => {
			// Arrange
			const account = await openSignedInAgent();

			// Act
			const response = await account.agent.get(SAGAS_URL);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).get(SAGAS_URL);

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});
