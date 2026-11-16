import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { openSignedInAgent } from "../../../../testUtils/integration/auth/openSignedInAgent.ts";
import { seedBacklogSaga } from "../../../../testUtils/integration/backlog/seedBacklogSaga.ts";
import { selectMediaRows } from "../../../../testUtils/integration/backlog/selectMediaRows.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectConflict } from "../../../../testUtils/integration/expectConflict.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";

function entriesUrl(sagaId: number): string {
	return `${ApiPrefixEnum.BACKLOG}/sagas/${sagaId}/entries`;
}

describe("reorderSaga", () => {
	describe("200 OK", () => {
		it("SHOULD give every media of the saga its new number", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const { sagaId, movieMediaId, showMediaId } = await seedBacklogSaga(
				account.userId,
			);

			// Act
			const response = await account.agent.put(entriesUrl(sagaId)).send({
				entries: [
					{ userMediaId: showMediaId, sagaNumber: 1 },
					{ userMediaId: movieMediaId, sagaNumber: 1.5 },
				],
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(
				(response.body as { entries: { userMediaId: number }[] }).entries.map(
					({ userMediaId }) => userMediaId,
				),
			).toStrictEqual([showMediaId, movieMediaId]);
			expect((await selectMediaRows.userMedia(movieMediaId))?.sagaNumber).toBe(
				1.5,
			);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD reject the same number given twice", async () => {
			// Arrange
			const account = await openSignedInAgent();

			// Act
			const response = await account.agent.put(entriesUrl(42)).send({
				entries: [
					{ userMediaId: 1, sagaNumber: 2 },
					{ userMediaId: 2, sagaNumber: 2 },
				],
			});

			// Assert
			expectValidationError(response, [
				{
					path: ["entries"],
					code: ValidationIssueCodeEnum.DUPLICATE_VALUE,
					message: "Entries should not give the same number twice",
				},
			]);
		});
	});

	describe("409 Conflict", () => {
		it("SHOULD refuse entries that are not exactly the media of the saga, and change nothing", async () => {
			// Arrange
			const account = await openSignedInAgent();
			const { sagaId, movieMediaId } = await seedBacklogSaga(account.userId);

			// Act
			const response = await account.agent
				.put(entriesUrl(sagaId))
				.send({ entries: [{ userMediaId: movieMediaId, sagaNumber: 5 }] });

			// Assert
			expectConflict(
				response,
				BacklogErrorCodeEnum.SAGA_ENTRIES_MISMATCH,
				`Entries are not the backlog media of saga : ${sagaId}`,
			);
			expect((await selectMediaRows.userMedia(movieMediaId))?.sagaNumber).toBe(
				1,
			);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer as absent the saga of another account", async () => {
			// Arrange
			const owner = await openSignedInAgent();
			const stranger = await openSignedInAgent();
			const { sagaId, movieMediaId, showMediaId } = await seedBacklogSaga(
				owner.userId,
			);

			// Act
			const response = await stranger.agent.put(entriesUrl(sagaId)).send({
				entries: [
					{ userMediaId: movieMediaId, sagaNumber: 2 },
					{ userMediaId: showMediaId, sagaNumber: 1 },
				],
			});

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
			const response = await request(app).put(entriesUrl(1)).send({});

			// Assert
			expectAuthenticationRequired(response);
		});
	});
});
