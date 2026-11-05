import { UserDataProjectEnum } from "@citadel/specs/src/projects/auth/enum/userDataProject.enum.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { insertTestAccount } from "../../../../testUtils/integration/auth/insertTestAccount.ts";
import { isSessionOpen } from "../../../../testUtils/integration/auth/isSessionOpen.ts";
import { openTestSession } from "../../../../testUtils/integration/auth/openTestSession.ts";
import { readRestoreJournal } from "../../../../testUtils/integration/auth/readRestoreJournal.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { selectBacklogRows } from "../../../../testUtils/integration/backlog/selectBacklogRows.ts";
import { buildUniqueIp } from "../../../../testUtils/integration/buildUniqueIp.ts";
import { expectAuthenticationRequired } from "../../../../testUtils/integration/expectAuthenticationRequired.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { countAccountProjectRows } from "../../../../testUtils/integration/projectData/countAccountProjectRows.ts";
import { seedAccountProjectData } from "../../../../testUtils/integration/projectData/seedAccountProjectData.ts";
import { AuthEventTypeEnum } from "../../enum/authEventType.enum.ts";
import { RestoreJournalActionEnum } from "../../enum/restoreJournalAction.enum.ts";

const GDC_TABLES = ["gdc_game", "gdc_boss", "gdc_death"] as const;
const BACKLOG_TABLES = [
	"backlog_user_game",
	"backlog_user_version",
	"backlog_done_dlc",
	"backlog_series",
] as const;

const DELETE_PROJECT_DATA_URL = `${ApiPrefixEnum.AUTH}/me/projects`;

async function deleteProjectData(
	projects: unknown,
	body: object,
	cookie?: string,
	ip = buildUniqueIp(),
) {
	const pending = request(app)
		.delete(DELETE_PROJECT_DATA_URL)
		.set("X-Real-IP", ip)
		.send({ projects, ...body });
	return cookie === undefined ? pending : pending.set("Cookie", cookie);
}

// Un compte au vrai mot de passe, connecté, avec une ligne dans chaque table des projets
async function openAccountWithData() {
	const account = await insertTestAccount();
	const session = await openTestSession({ userId: account.userId });
	const data = await seedAccountProjectData(account.userId);
	return { account, session, data };
}

describe("deleteProjectData", () => {
	describe("204 No Content", () => {
		it("SHOULD delete every Game Death Counter row of the account, and nothing else", async () => {
			// Arrange
			const { account, session } = await openAccountWithData();
			const stranger = await insertTestAccount();
			await seedAccountProjectData(stranger.userId);

			// Act
			const response = await deleteProjectData(
				[UserDataProjectEnum.GAME_DEATH_COUNTER],
				{ password: account.password },
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(
				await countAccountProjectRows(account.userId, GDC_TABLES),
			).toStrictEqual({ gdc_game: 0, gdc_boss: 0, gdc_death: 0 });
			expect(
				await countAccountProjectRows(account.userId, BACKLOG_TABLES),
			).toStrictEqual({
				backlog_user_game: 1,
				backlog_user_version: 1,
				backlog_done_dlc: 1,
				backlog_series: 1,
			});
			expect(
				await countAccountProjectRows(stranger.userId, GDC_TABLES),
			).toStrictEqual({ gdc_game: 1, gdc_boss: 1, gdc_death: 1 });
			expect(await isSessionOpen(session.cookie)).toBe(true);
		});

		it("SHOULD delete the backlog of the account, its series included, and keep the shared IGDB data", async () => {
			// Arrange
			const { account, session, data } = await openAccountWithData();
			const stranger = await insertTestAccount();
			await seedAccountProjectData(stranger.userId);

			// Act
			const response = await deleteProjectData(
				[UserDataProjectEnum.BACKLOG],
				{ password: account.password },
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(
				await countAccountProjectRows(account.userId, BACKLOG_TABLES),
			).toStrictEqual({
				backlog_user_game: 0,
				backlog_user_version: 0,
				backlog_done_dlc: 0,
				backlog_series: 0,
			});
			expect(
				(await selectBacklogRows.gameIds(data.backlog.gameId)).dlcIds,
			).toStrictEqual([data.backlog.dlcId]);
			expect(
				await countAccountProjectRows(account.userId, GDC_TABLES),
			).toStrictEqual({ gdc_game: 1, gdc_boss: 1, gdc_death: 1 });
			expect(
				await countAccountProjectRows(stranger.userId, BACKLOG_TABLES),
			).toStrictEqual({
				backlog_user_game: 1,
				backlog_user_version: 1,
				backlog_done_dlc: 1,
				backlog_series: 1,
			});
		});

		it("SHOULD delete both projects at once, the account and its session kept", async () => {
			// Arrange
			const { account, session } = await openAccountWithData();

			// Act
			const response = await deleteProjectData(
				[UserDataProjectEnum.GAME_DEATH_COUNTER, UserDataProjectEnum.BACKLOG],
				{ password: account.password },
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(
				await countAccountProjectRows(account.userId, [
					...GDC_TABLES,
					...BACKLOG_TABLES,
				]),
			).toStrictEqual({
				gdc_game: 0,
				gdc_boss: 0,
				gdc_death: 0,
				backlog_user_game: 0,
				backlog_user_version: 0,
				backlog_done_dlc: 0,
				backlog_series: 0,
			});
			expect(await isSessionOpen(session.cookie)).toBe(true);
			expect(await readRestoreJournal(account.userId)).toMatchObject([
				{
					action: RestoreJournalActionEnum.PROJECT_DATA_DELETED,
					projects: [
						UserDataProjectEnum.GAME_DEATH_COUNTER,
						UserDataProjectEnum.BACKLOG,
					],
				},
			]);
		});

		it("SHOULD answer the same and note it WHEN the project has no data of the account", async () => {
			// Arrange
			const account = await insertTestAccount();
			const session = await openTestSession({ userId: account.userId });

			// Act
			const response = await deleteProjectData(
				[UserDataProjectEnum.BACKLOG],
				{ password: account.password },
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			const eventIds = await selectAuthRows.rowIdsByUserId(
				"auth_event",
				account.userId,
			);
			const events = await Promise.all(
				eventIds.map(async (id) => selectAuthRows.event(id)),
			);
			expect(events.map((event) => event?.type)).toContain(
				AuthEventTypeEnum.PROJECT_DATA_DELETED,
			);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD keep every row WHEN the password is wrong", async () => {
			// Arrange
			const { account, session } = await openAccountWithData();

			// Act
			const response = await deleteProjectData(
				[UserDataProjectEnum.BACKLOG],
				{ password: "pas le bon mot de passe" },
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
			expect(response.body).toStrictEqual({
				code: AuthErrorCodeEnum.WRONG_PASSWORD,
				message: "Wrong password",
			});
			expect(
				await countAccountProjectRows(account.userId, BACKLOG_TABLES),
			).toStrictEqual({
				backlog_user_game: 1,
				backlog_user_version: 1,
				backlog_done_dlc: 1,
				backlog_series: 1,
			});
			expect(await readRestoreJournal(account.userId)).toStrictEqual([]);
		});

		it("SHOULD refuse a project that keeps no data of the account", async () => {
			// Arrange
			const account = await insertTestAccount();
			const session = await openTestSession({ userId: account.userId });

			// Act
			const response = await deleteProjectData(
				["satisfactory"],
				{ password: account.password },
				session.cookie,
			);

			// Assert
			expectValidationError(response, [
				{
					path: ["projects", 0],
					code: ValidationIssueCodeEnum.INVALID_VALUE,
					message: "Project is not valid",
				},
			]);
		});

		it("SHOULD refuse WHEN no project is chosen", async () => {
			// Arrange
			const account = await insertTestAccount();
			const session = await openTestSession({ userId: account.userId });

			// Act
			const response = await deleteProjectData(
				[],
				{ password: account.password },
				session.cookie,
			);

			// Assert
			expectValidationError(response, [
				{
					path: ["projects"],
					code: ValidationIssueCodeEnum.TOO_SMALL,
					message: "Projects should contain at least 1 project",
					limit: 1,
				},
			]);
		});

		it("SHOULD refuse WHEN the same project is chosen twice", async () => {
			// Arrange
			const { account, session } = await openAccountWithData();

			// Act
			const response = await deleteProjectData(
				[UserDataProjectEnum.BACKLOG, UserDataProjectEnum.BACKLOG],
				{ password: account.password },
				session.cookie,
			);

			// Assert
			expectValidationError(response, [
				{
					path: ["projects"],
					code: ValidationIssueCodeEnum.DUPLICATE_VALUE,
					message: "Projects should not contain the same project twice",
				},
			]);
			expect(
				(await countAccountProjectRows(account.userId, ["backlog_user_game"]))
					.backlog_user_game,
			).toBe(1);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN the request has no session", async () => {
			// Act
			const response = await deleteProjectData([UserDataProjectEnum.BACKLOG], {
				password: "x",
			});

			// Assert
			expectAuthenticationRequired(response);
		});
	});

	describe("429 Too Many Requests", () => {
		it("SHOULD make the account wait 2 s WHEN the password was just wrong", async () => {
			// Arrange
			const { account, session } = await openAccountWithData();
			const ip = buildUniqueIp();
			await deleteProjectData(
				[UserDataProjectEnum.BACKLOG],
				{ password: "pas le bon" },
				session.cookie,
				ip,
			);

			// Act
			const response = await deleteProjectData(
				[UserDataProjectEnum.BACKLOG],
				{ password: account.password },
				session.cookie,
				ip,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS);
			expect(response.headers["retry-after"]).toBeDefined();
			expect(
				(await countAccountProjectRows(account.userId, ["backlog_user_game"]))
					.backlog_user_game,
			).toBe(1);
		});
	});
});
