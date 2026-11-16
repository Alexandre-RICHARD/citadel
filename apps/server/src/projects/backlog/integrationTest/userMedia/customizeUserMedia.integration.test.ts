import { SagaChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/sagaChoiceKind.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { insertMediaRows } from "../../../../testUtils/integration/backlog/insertMediaRows.ts";
import { nextTmdbId } from "../../../../testUtils/integration/backlog/nextTmdbId.ts";
import { selectMediaRows } from "../../../../testUtils/integration/backlog/selectMediaRows.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";

function customizeUrl(userMediaId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/user-media/${userMediaId}`;
}

// Un compte connecté avec un film de son backlog rangé dans une saga, au numéro 1
async function openAccountWithMovieInSaga(sagaName = "Alien") {
	const account = await openSignedInAgent();
	const movieId = await nextTmdbId();
	await insertMediaRows.movie({ id: movieId, title: "Alien" });
	const sagaId = await insertMediaRows.saga({
		userId: account.userId,
		name: sagaName,
	});
	const userMediaId = await insertMediaRows.userMedia({
		userId: account.userId,
		movieId,
		sagaId,
		sagaNumber: 1,
	});
	return { account, sagaId, userMediaId };
}

describe("customizeUserMedia", () => {
	describe("200 OK", () => {
		it("SHOULD change the thumbnail and push the media that had the number", async () => {
			// Arrange
			const { account, sagaId, userMediaId } =
				await openAccountWithMovieInSaga();
			const movieId = await nextTmdbId();
			await insertMediaRows.movie({ id: movieId, title: "Aliens" });
			const secondId = await insertMediaRows.userMedia({
				userId: account.userId,
				movieId,
				sagaId,
				sagaNumber: 2,
			});

			// Act
			const response = await account.agent.put(customizeUrl(secondId)).send({
				imagePath: "/aliens.jpg",
				saga: { kind: SagaChoiceKindEnum.OTHER, sagaId },
				sagaNumber: 1,
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toMatchObject({
				imagePath: "/aliens.jpg",
				saga: { id: sagaId, name: "Alien" },
				sagaNumber: 1,
			});
			expect(await selectMediaRows.userMedia(userMediaId)).toMatchObject({
				sagaNumber: 2,
			});
		});

		it("SHOULD delete the saga WHEN its last media leaves it", async () => {
			// Arrange
			const { account, userMediaId } = await openAccountWithMovieInSaga();

			// Act
			const response = await account.agent.put(customizeUrl(userMediaId)).send({
				imagePath: null,
				saga: { kind: SagaChoiceKindEnum.NONE },
				sagaNumber: 4,
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toMatchObject({ saga: null, sagaNumber: null });
			expect(await selectMediaRows.sagaNames(account.userId)).toStrictEqual([]);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer as absent the media of another account", async () => {
			// Arrange
			const { userMediaId } = await openAccountWithMovieInSaga();
			const stranger = await openSignedInAgent();

			// Act
			const response = await stranger.agent
				.put(customizeUrl(userMediaId))
				.send({
					imagePath: null,
					saga: { kind: SagaChoiceKindEnum.NONE },
					sagaNumber: null,
				});

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.USER_MEDIA_NOT_FOUND,
				`No backlog media with id : ${userMediaId}`,
			);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).put(customizeUrl(1)).send({});

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});
