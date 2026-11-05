import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { insertAuthRows } from "../../../../testUtils/integration/auth/insertAuthRows.ts";
import { insertTestAccount } from "../../../../testUtils/integration/auth/insertTestAccount.ts";
import { insertTestRecoveryCodes } from "../../../../testUtils/integration/auth/insertTestRecoveryCodes.ts";
import { insertTestTotpFactor } from "../../../../testUtils/integration/auth/insertTestTotpFactor.ts";
import { openTestSession } from "../../../../testUtils/integration/auth/openTestSession.ts";
import { seedAccountProjectData } from "../../../../testUtils/integration/projectData/seedAccountProjectData.ts";
import { readStoredZip } from "../../../../testUtils/zip/readStoredZip.ts";

const EXPORT_URL = `${ApiPrefixEnum.AUTH}/me/export`;

async function exportData(cookie?: string) {
	const pending = request(app)
		.get(EXPORT_URL)
		.buffer(true)
		.parse((response, callback) => {
			const chunks: Buffer[] = [];
			response.on("data", (chunk: Buffer) => chunks.push(chunk));
			response.on("end", () => {
				callback(null, Buffer.concat(chunks));
			});
		});
	return cookie === undefined ? pending : pending.set("Cookie", cookie);
}

// Les lignes de données d'un CSV, sans son en-tête
function readDataLines(content: string | undefined): string[] {
	return (content ?? "").trim().split("\r\n").slice(1);
}

function readFiles(response: request.Response): Record<string, string> {
	return Object.fromEntries(
		readStoredZip(response.body as Buffer).map(({ name, content }) => [
			name,
			content,
		]),
	);
}

describe("exportMyData", () => {
	describe("200 OK", () => {
		it("SHOULD download a ZIP attachment, never cached", async () => {
			// Arrange
			const session = await openTestSession();

			// Act
			const response = await exportData(session.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.headers["content-type"]).toBe("application/zip");
			expect(response.headers["cache-control"]).toBe("no-store");
			expect(response.headers["content-disposition"]).toMatch(
				/^attachment; filename="citadel-mes-donnees-\d{4}-\d{2}-\d{2}\.zip"$/u,
			);
			expect(Object.keys(readFiles(response))).toStrictEqual([
				"auth_user.csv",
				"auth_session.csv",
				"auth_factor.csv",
				"auth_recovery_code.csv",
				"auth_event.csv",
				"auth_flow.csv",
				"gdc_game.csv",
				"gdc_boss.csv",
				"gdc_death.csv",
				"backlog_user_game.csv",
				"backlog_user_version.csv",
				"backlog_done_dlc.csv",
				"backlog_series.csv",
			]);
		});

		it("SHOULD export every row of the user in the projects, and only theirs", async () => {
			// Arrange
			const account = await insertTestAccount();
			const session = await openTestSession({ userId: account.userId });
			const data = await seedAccountProjectData(account.userId);
			const stranger = await insertTestAccount();
			await seedAccountProjectData(stranger.userId);

			// Act
			const files = readFiles(await exportData(session.cookie));

			// Assert
			expect(readDataLines(files["gdc_game.csv"])).toStrictEqual([
				expect.stringMatching(
					new RegExp(`^${data.gdc.gameId},Hollow Knight,,`, "u"),
				),
			]);
			expect(readDataLines(files["gdc_boss.csv"])).toStrictEqual([
				expect.stringMatching(
					new RegExp(`^${data.gdc.bossId},${data.gdc.gameId},Hornet,,1,`, "u"),
				),
			]);
			expect(readDataLines(files["gdc_death.csv"])).toStrictEqual([
				expect.stringMatching(
					new RegExp(
						`^${data.gdc.deathId},${data.gdc.bossId},2017-02-24T20:00:00.000Z,,`,
						"u",
					),
				),
			]);
			expect(readDataLines(files["backlog_user_game.csv"])).toStrictEqual([
				expect.stringMatching(
					new RegExp(
						`^${data.backlog.gameId},,story,${data.backlog.seriesId},1,`,
						"u",
					),
				),
			]);
			expect(readDataLines(files["backlog_user_version.csv"])).toStrictEqual([
				expect.stringMatching(
					new RegExp(
						`^${data.backlog.userVersionId},${data.backlog.gameId},`,
						"u",
					),
				),
			]);
			expect(readDataLines(files["backlog_done_dlc.csv"])).toStrictEqual([
				expect.stringMatching(
					new RegExp(
						`^${data.backlog.userVersionId},${data.backlog.dlcId},`,
						"u",
					),
				),
			]);
			expect(readDataLines(files["backlog_series.csv"])).toStrictEqual([
				expect.stringMatching(
					new RegExp(`^${data.backlog.seriesId},Mes jeux,`, "u"),
				),
			]);
		});

		it("SHOULD export every row of the user, and only theirs", async () => {
			// Arrange
			const account = await insertTestAccount();
			const session = await openTestSession({ userId: account.userId });
			await openTestSession({ userId: account.userId });
			await insertTestTotpFactor({ userId: account.userId });
			await insertTestRecoveryCodes(account.userId, 3);
			await insertAuthRows.event({ userId: account.userId });
			const stranger = await insertTestAccount();
			await openTestSession({ userId: stranger.userId });

			// Act
			const files = readFiles(await exportData(session.cookie));

			// Assert
			expect(files["auth_user.csv"]).toContain(account.email);
			expect(files["auth_user.csv"]).toContain(account.username);
			expect(files["auth_user.csv"]).not.toContain(stranger.email);
			expect(files["auth_session.csv"]?.trim().split("\r\n")).toHaveLength(3);
			expect(files["auth_factor.csv"]?.trim().split("\r\n")).toHaveLength(2);
			expect(
				files["auth_recovery_code.csv"]?.trim().split("\r\n"),
			).toHaveLength(4);
			expect(files["auth_event.csv"]).toContain("login_failure");
		});

		it("SHOULD export no secret: neither hash, nor digest, nor TOTP secret", async () => {
			// Arrange
			const account = await insertTestAccount();
			const session = await openTestSession({ userId: account.userId });
			await insertTestTotpFactor({ userId: account.userId });
			await insertTestRecoveryCodes(account.userId, 2);

			// Act
			const response = await exportData(session.cookie);

			// Assert
			const everything = Object.values(readFiles(response)).join("\n");
			const headers = Object.values(readFiles(response))
				.map((content) => content.split("\r\n")[0] ?? "")
				.join(",");
			for (const secretColumn of [
				"password_hash",
				"token_hash",
				"secret_encrypted",
				"key_version",
				"last_used_step",
				"code_hash",
				"code_hmac",
				"link_token_hash",
				"payload",
			])
				expect(headers).not.toContain(secretColumn);
			expect(everything).not.toContain("argon2id");
			expect(everything).not.toContain(session.token);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN the request has no session", async () => {
			// Act
			const response = await exportData();

			// Assert
			expect(response.status).toBe(
				HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION,
			);
		});
	});
});
