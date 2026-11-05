import { randomBytes } from "node:crypto";

import { UserDataProjectEnum } from "@citadel/specs/src/projects/auth/enum/userDataProject.enum.ts";
import { describe, expect, it } from "vitest";

import { insertAuthRows } from "../../../testUtils/integration/auth/insertAuthRows.ts";
import { insertTestAccount } from "../../../testUtils/integration/auth/insertTestAccount.ts";
import { selectAuthRows } from "../../../testUtils/integration/auth/selectAuthRows.ts";
import { countAccountProjectRows } from "../../../testUtils/integration/projectData/countAccountProjectRows.ts";
import { seedAccountProjectData } from "../../../testUtils/integration/projectData/seedAccountProjectData.ts";
import type { RestoreJournalLineBean } from "../bean/restoreJournalLineBean.type.ts";
import { RestoreJournalActionEnum } from "../enum/restoreJournalAction.enum.ts";
import { passwordService } from "./passwordService.ts";
import { restoreReplayService } from "./restoreReplayService.ts";

// Les lignes sont données au rejeu : il ne touche qu'aux comptes de chaque test, jamais à ceux des tests voisins.
// closeEverySessionAndFlow vide les tables pour tous : il se vérifie en prod:local (cahier, §17)
const AT = new Date("2026-11-05T10:00:00.000Z");
// Un identifiant qu'aucun compte des tests n'atteint
const MISSING_USER_ID = 2_000_000_000;

function at(minutes: number): Date {
	return new Date(AT.getTime() + minutes * 60 * 1000);
}

describe("restoreReplayService", () => {
	describe("replay", () => {
		it("SHOULD delete again an account the backup brought back, with its project data", async () => {
			// Arrange
			const account = await insertTestAccount();
			await seedAccountProjectData(account.userId);

			// Act
			const report = await restoreReplayService.replay([
				{
					at: AT,
					userId: account.userId,
					username: account.username,
					action: RestoreJournalActionEnum.ACCOUNT_DELETED,
				},
			]);

			// Assert
			expect(report).toMatchObject({ replayed: 1 });
			expect(await selectAuthRows.user(account.userId)).toBeNull();
			expect(
				Object.values(await countAccountProjectRows(account.userId)),
			).toStrictEqual([0, 0, 0, 0, 0, 0, 0]);
		});

		it("SHOULD empty again only the projects that were emptied", async () => {
			// Arrange
			const account = await insertTestAccount();
			await seedAccountProjectData(account.userId);

			// Act
			await restoreReplayService.replay([
				{
					at: AT,
					userId: account.userId,
					username: account.username,
					action: RestoreJournalActionEnum.PROJECT_DATA_DELETED,
					projects: [UserDataProjectEnum.GAME_DEATH_COUNTER],
				},
			]);

			// Assert
			expect(
				await countAccountProjectRows(account.userId, [
					"gdc_game",
					"backlog_user_game",
				]),
			).toStrictEqual({ gdc_game: 0, backlog_user_game: 1 });
			expect(await selectAuthRows.user(account.userId)).not.toBeNull();
		});

		it("SHOULD give back the last address WHEN the account changed it twice", async () => {
			// Arrange
			const account = await insertTestAccount();
			const lines: RestoreJournalLineBean[] = [
				{
					at: at(1),
					userId: account.userId,
					username: account.username,
					action: RestoreJournalActionEnum.EMAIL_CHANGED,
					email: `premiere-${account.email}`,
				},
				{
					at: at(2),
					userId: account.userId,
					username: account.username,
					action: RestoreJournalActionEnum.EMAIL_CHANGED,
					email: `derniere-${account.email}`,
				},
			];

			// Act
			const report = await restoreReplayService.replay(lines);

			// Assert
			expect(report).toMatchObject({ replayed: 2, emailConflicts: 0 });
			expect((await selectAuthRows.user(account.userId))?.email).toBe(
				`derniere-${account.email}`,
			);
		});

		it("SHOULD keep the old address and count the conflict WHEN another account of the backup has the new one", async () => {
			// Arrange
			const account = await insertTestAccount();
			const owner = await insertTestAccount();

			// Act
			const report = await restoreReplayService.replay([
				{
					at: AT,
					userId: account.userId,
					username: account.username,
					action: RestoreJournalActionEnum.EMAIL_CHANGED,
					email: owner.email,
				},
			]);

			// Assert
			expect(report).toMatchObject({ replayed: 0, emailConflicts: 1 });
			expect((await selectAuthRows.user(account.userId))?.email).toBe(
				account.email,
			);
		});

		it("SHOULD mark again as used a recovery code the backup brought back", async () => {
			// Arrange
			const account = await insertTestAccount();
			const codeHash = randomBytes(32);
			const codeId = await insertAuthRows.recoveryCode({
				userId: account.userId,
				codeHash,
			});

			// Act
			const report = await restoreReplayService.replay([
				{
					at: AT,
					userId: account.userId,
					username: account.username,
					action: RestoreJournalActionEnum.RECOVERY_CODE_USED,
					codeHash: codeHash.toString("hex"),
				},
			]);

			// Assert
			expect(report).toMatchObject({ replayed: 1 });
			expect((await selectAuthRows.recoveryCode(codeId))?.usedAt).toStrictEqual(
				AT,
			);
		});

		it("SHOULD leave alone the account that now holds the id WHEN it is not the one of the line", async () => {
			// Arrange
			const account = await insertTestAccount();
			const lineOf = {
				at: AT,
				userId: account.userId,
				username: "un-ancien-compte",
			};

			// Act
			const report = await restoreReplayService.replay([
				{
					...lineOf,
					action: RestoreJournalActionEnum.EMAIL_CHANGED,
					email: `autre-${account.email}`,
				},
				{ ...lineOf, action: RestoreJournalActionEnum.SECURITY_CHANGED },
				{ ...lineOf, action: RestoreJournalActionEnum.ACCOUNT_DELETED },
			]);

			// Assert
			expect(report).toStrictEqual({
				replayed: 0,
				skippedMissingAccount: 3,
				emailConflicts: 0,
				invalidatedPasswords: 0,
			});
			const user = await selectAuthRows.user(account.userId);
			expect(user?.email).toBe(account.email);
			expect(
				await passwordService.verify(
					account.password,
					user?.passwordHash ?? null,
				),
			).toBe(true);
		});

		it("SHOULD skip and count every line WHEN its account is not in the backup", async () => {
			// Arrange
			const missing = { userId: MISSING_USER_ID, username: "personne" };

			// Act
			const report = await restoreReplayService.replay([
				{
					at: AT,
					...missing,
					action: RestoreJournalActionEnum.ACCOUNT_DELETED,
				},
				{
					at: at(1),
					...missing,
					action: RestoreJournalActionEnum.SECURITY_CHANGED,
				},
			]);

			// Assert
			expect(report).toStrictEqual({
				replayed: 0,
				skippedMissingAccount: 2,
				emailConflicts: 0,
				invalidatedPasswords: 0,
			});
		});

		it("SHOULD invalidate the password once, and count each line, WHEN the account changed its security several times", async () => {
			// Arrange
			const account = await insertTestAccount();
			const securityChange = {
				userId: account.userId,
				username: account.username,
				action: RestoreJournalActionEnum.SECURITY_CHANGED,
			} as const;

			// Act
			const report = await restoreReplayService.replay([
				{ at: at(1), ...securityChange },
				{ at: at(2), ...securityChange },
			]);

			// Assert
			expect(report).toMatchObject({ replayed: 2, invalidatedPasswords: 1 });
			const user = await selectAuthRows.user(account.userId);
			expect(
				await passwordService.verify(
					account.password,
					user?.passwordHash ?? null,
				),
			).toBe(false);
		});

		it("SHOULD invalidate nothing WHEN the account was deleted after changing its security", async () => {
			// Arrange
			const account = await insertTestAccount();
			const lineOf = { userId: account.userId, username: account.username };

			// Act
			const report = await restoreReplayService.replay([
				{
					at: at(1),
					...lineOf,
					action: RestoreJournalActionEnum.SECURITY_CHANGED,
				},
				{
					at: at(2),
					...lineOf,
					action: RestoreJournalActionEnum.ACCOUNT_DELETED,
				},
			]);

			// Assert
			expect(report).toMatchObject({
				replayed: 1,
				skippedMissingAccount: 1,
				invalidatedPasswords: 0,
			});
			expect(await selectAuthRows.user(account.userId)).toBeNull();
		});
	});
});
