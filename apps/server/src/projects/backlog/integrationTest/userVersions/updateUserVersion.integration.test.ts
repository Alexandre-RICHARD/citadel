import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { seedBacklogGame } from "../../../../testUtils/integration/backlog/seedBacklogGame.ts";
import { selectBacklogRows } from "../../../../testUtils/integration/backlog/selectBacklogRows.ts";
import { expectConflict } from "../../../../testUtils/integration/expectConflict.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { NON_EXISTENT_ID } from "../../../../testUtils/integration/nonExistentId.ts";

function updateUrl(id: number): string {
	return `${ApiPrefixEnum.BACKLOG}/user-versions/${id}`;
}

describe("updateUserVersion", () => {
	describe("200 OK", () => {
		it("SHOULD change only the given fields and give the row", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame();
			const [userVersionId = 0] = backlogGame.userVersionIds;

			// Act
			const response = await request(app)
				.patch(updateUrl(userVersionId))
				.send({ rating: 15, comment: "", trackedPlayTimeMinutes: 90 });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(
				await selectBacklogRows.userVersions(backlogGame.gameId),
			).toMatchObject([
				{
					id: userVersionId,
					status: StatusEnum.NOT_STARTED,
					rating: 15,
					// Un commentaire vide devient null
					comment: null,
					trackedPlayTimeMinutes: 90,
					sureFinishCount: 0,
				},
			]);
		});

		it("SHOULD count a first sure finish WHEN the status reaches rank 5", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame();

			// Act
			await request(app)
				.patch(updateUrl(backlogGame.userVersionIds[0] ?? 0))
				.send({ status: StatusEnum.COMPLETED });

			// Assert
			expect(
				(await selectBacklogRows.userVersions(backlogGame.gameId))[0]
					?.sureFinishCount,
			).toBe(1);
		});

		it("SHOULD keep the counter sent with the status", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame();

			// Act
			await request(app)
				.patch(updateUrl(backlogGame.userVersionIds[0] ?? 0))
				.send({ status: StatusEnum.FINISHED, sureFinishCount: 0 });

			// Assert
			expect(
				(await selectBacklogRows.userVersions(backlogGame.gameId))[0]
					?.sureFinishCount,
			).toBe(0);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD reject an empty body", async () => {
			// Act
			const response = await request(app).patch(updateUrl(42)).send({});

			// Assert
			expectValidationError(response, [
				{
					path: [],
					code: ValidationIssueCodeEnum.MISSING_FIELDS,
					message: expect.stringContaining("At least one of") as string,
				},
			]);
		});

		it("SHOULD reject a rating above 20", async () => {
			// Act
			const response = await request(app)
				.patch(updateUrl(42))
				.send({ rating: 25 });

			// Assert
			expectValidationError(response, [
				{
					path: ["rating"],
					code: ValidationIssueCodeEnum.TOO_BIG,
					limit: 20,
					message: "Rating should be at most 20",
				},
			]);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer that the played version does not exist", async () => {
			// Act
			const response = await request(app)
				.patch(updateUrl(NON_EXISTENT_ID))
				.send({ isOwned: true });

			// Assert
			expectNotFound(
				response,
				BacklogErrorCodeEnum.USER_VERSION_NOT_FOUND,
				`No played version with id : ${NON_EXISTENT_ID}`,
			);
		});
	});

	describe("409 Conflict", () => {
		it("SHOULD refuse a status that the ending type of the game does not offer", async () => {
			// Arrange
			const backlogGame = await seedBacklogGame({
				endingType: EndingTypeEnum.SANDBOX,
			});

			// Act
			const response = await request(app)
				.patch(updateUrl(backlogGame.userVersionIds[0] ?? 0))
				.send({ status: StatusEnum.FINISHED });

			// Assert
			expectConflict(
				response,
				BacklogErrorCodeEnum.STATUS_NOT_ALLOWED,
				`Status ${StatusEnum.FINISHED} is not offered for ending type : ${EndingTypeEnum.SANDBOX}`,
			);
		});
	});
});
