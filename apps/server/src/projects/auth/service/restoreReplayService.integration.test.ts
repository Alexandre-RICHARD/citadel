import { UserDataProjectEnum } from "@citadel/specs/src/projects/auth/enum/userDataProject.enum.ts";
import { describe, expect, it } from "vitest";

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
					action: RestoreJournalActionEnum.EMAIL_CHANGED,
					email: `premiere-${account.email}`,
				},
				{
					at: at(2),
					userId: account.userId,
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

		it("SHOULD skip a line WHEN its account is not in the backup", async () => {
			// Act
			const report = await restoreReplayService.replay([
				{
					at: AT,
					userId: MISSING_USER_ID,
					action: RestoreJournalActionEnum.ACCOUNT_DELETED,
				},
				{
					at: at(1),
					userId: MISSING_USER_ID,
					action: RestoreJournalActionEnum.SECURITY_CHANGED,
				},
			]);

			// Assert
			expect(report).toMatchObject({
				skippedMissingAccount: 1,
				invalidatedPasswords: 0,
			});
		});

		it("SHOULD invalidate the password once WHEN the account changed its security several times", async () => {
			// Arrange
			const account = await insertTestAccount();
			const securityChange = {
				userId: account.userId,
				action: RestoreJournalActionEnum.SECURITY_CHANGED,
			} as const;

			// Act
			const report = await restoreReplayService.replay([
				{ at: at(1), ...securityChange },
				{ at: at(2), ...securityChange },
			]);

			// Assert
			expect(report).toMatchObject({ invalidatedPasswords: 1 });
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

			// Act
			const report = await restoreReplayService.replay([
				{
					at: at(1),
					userId: account.userId,
					action: RestoreJournalActionEnum.SECURITY_CHANGED,
				},
				{
					at: at(2),
					userId: account.userId,
					action: RestoreJournalActionEnum.ACCOUNT_DELETED,
				},
			]);

			// Assert
			expect(report).toMatchObject({ replayed: 2, invalidatedPasswords: 0 });
			expect(await selectAuthRows.user(account.userId)).toBeNull();
		});
	});
});
