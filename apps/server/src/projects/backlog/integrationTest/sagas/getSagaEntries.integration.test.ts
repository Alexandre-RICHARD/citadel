import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { seedBacklogSaga } from "../../../../testUtils/integration/backlog/seedBacklogSaga.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";

function entriesUrl(sagaId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/sagas/${sagaId}/entries`;
}

describe("getSagaEntries", () => {
	describe("200 OK", () => {
		it("SHOULD give the films and shows of the saga by number", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const { sagaId, movieMediaId, showMediaId } = await seedBacklogSaga(
				account.userId,
			);

			// Act
			const response = await account.agent.get(entriesUrl(sagaId));

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toStrictEqual({
				entries: [
					{
						userMediaId: movieMediaId,
						sagaNumber: 1,
						mediaType: MediaTypeEnum.MOVIE,
						title: "Un nouvel espoir",
						originalTitle: "Un nouvel espoir",
						releaseDate: "1977-05-25",
					},
					{
						userMediaId: showMediaId,
						sagaNumber: 2,
						mediaType: MediaTypeEnum.SHOW,
						title: "The Mandalorian",
						originalTitle: "The Mandalorian",
						releaseDate: null,
					},
				],
			});
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer as absent the saga of another account", async () => {
			// Arrange
			const owner = await openSignedInAgent();
			const stranger = await openSignedInAgent();
			const { sagaId } = await seedBacklogSaga(owner.userId);

			// Act
			const response = await stranger.agent.get(entriesUrl(sagaId));

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.SAGA_NOT_FOUND,
				`No saga with id : ${sagaId}`,
			);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).get(entriesUrl(1));

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});
