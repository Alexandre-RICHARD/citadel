import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { insertMediaRows } from "../../../../testUtils/integration/backlog/insertMediaRows.ts";
import { nextTmdbId } from "../../../../testUtils/integration/backlog/nextTmdbId.ts";
import { seedBacklogShow } from "../../../../testUtils/integration/backlog/seedBacklogShow.ts";
import { selectMediaRows } from "../../../../testUtils/integration/backlog/selectMediaRows.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectConflict } from "../../../../testUtils/integration/expectConflict.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";

function updateUrl(userMediaId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/user-media/${userMediaId}`;
}

async function openAccountWithMovie() {
	const account = await openSignedInAgent();
	const movieId = await nextTmdbId();
	await insertMediaRows.movie({ id: movieId, title: "Heat" });
	const userMediaId = await insertMediaRows.userMedia({
		userId: account.userId,
		movieId,
	});
	return { account, userMediaId };
}

describe("updateUserMedia", () => {
	describe("200 OK", () => {
		it("SHOULD change only the fields sent", async () => {
			// Arrange
			const { account, userMediaId } = await openAccountWithMovie();

			// Act
			const response = await account.agent.patch(updateUrl(userMediaId)).send({
				isWatched: true,
				comment: "  Revu en 4K  ",
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toMatchObject({
				isWatched: true,
				isUpNext: false,
				isInProgress: false,
				comment: "Revu en 4K",
			});
			expect(await selectMediaRows.userMedia(userMediaId)).toMatchObject({
				isWatched: 1,
				isUpNext: 0,
				comment: "Revu en 4K",
			});
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD refuse an empty body", async () => {
			// Arrange
			const { account, userMediaId } = await openAccountWithMovie();

			// Act
			const response = await account.agent
				.patch(updateUrl(userMediaId))
				.send({});

			// Assert
			expectValidationError(response, [
				{
					path: [],
					code: ValidationIssueCodeEnum.MISSING_FIELDS,
					message:
						"At least one of isWatched, isUpNext, isInProgress, comment should be provided",
				},
			]);
		});
	});

	describe("409 Conflict", () => {
		it("SHOULD refuse to mark a show as watched, its episodes being the ones to tick", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const show = await seedBacklogShow({ episodeCounts: [0, 2] });
			const userMediaId = await insertMediaRows.userMedia({
				userId: account.userId,
				tvShowId: show.tvShowId,
			});

			// Act
			const response = await account.agent
				.patch(updateUrl(userMediaId))
				.send({ isWatched: true });

			// Assert
			expectConflict(
				response,
				BacklogErrorCodeEnum.WATCHED_ONLY_FOR_MOVIES,
				`Backlog media ${userMediaId} is a show: its episodes are watched, not the show`,
			);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app)
				.patch(updateUrl(1))
				.send({ isUpNext: true });

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});
