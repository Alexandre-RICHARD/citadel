import { DatabaseError, UniqueConstraintError } from "sequelize";
import { describe, expect, it } from "vitest";

import { sequelize } from "../../configuration/sequelize.ts";
import { insertAuthRows } from "../../testUtils/integration/auth/insertAuthRows.ts";
import { selectAuthRows } from "../../testUtils/integration/auth/selectAuthRows.ts";
import { buildUniqueWord } from "../../testUtils/integration/buildUniqueWord.ts";

// La migration V014. Les mots tirés sont en minuscules : chaque test choisit lui-même la casse qu'il compare
function buildLowercaseWord(): string {
	return buildUniqueWord().toLowerCase();
}

describe("createAuthUserTable", () => {
	describe("email", () => {
		it("SHOULD refuse an email WHEN an account already has it in another case", async () => {
			// Arrange
			const word = buildLowercaseWord();
			await insertAuthRows.user({ email: `alex${word}@example.com` });

			// Act
			const insertion = insertAuthRows.user({
				email: `Alex${word}@example.com`,
			});

			// Assert
			await expect(insertion).rejects.toThrow(UniqueConstraintError);
		});

		it("SHOULD accept both emails WHEN they differ only by an accent", async () => {
			// Arrange
			const word = buildLowercaseWord();

			// Act
			const accentedId = await insertAuthRows.user({
				email: `josé${word}@example.com`,
			});
			const plainId = await insertAuthRows.user({
				email: `jose${word}@example.com`,
			});

			// Assert
			expect(accentedId).not.toBe(plainId);
			expect(
				await selectAuthRows.userIdsByEmail(`josé${word}@example.com`),
			).toStrictEqual([accentedId]);
			expect(
				await selectAuthRows.userIdsByEmail(`jose${word}@example.com`),
			).toStrictEqual([plainId]);
		});

		it("SHOULD keep the email as typed and find it in any case WHEN it has capitals", async () => {
			// Arrange
			const word = buildLowercaseWord();
			const id = await insertAuthRows.user({
				email: `Alex${word}@Example.com`,
			});

			// Act
			const foundIds = await selectAuthRows.userIdsByEmail(
				`ALEX${word.toUpperCase()}@EXAMPLE.COM`,
			);

			// Assert
			expect(foundIds).toStrictEqual([id]);
			expect((await selectAuthRows.user(id))?.email).toBe(
				`Alex${word}@Example.com`,
			);
		});

		it("SHOULD accept both emails WHEN they differ by a sharp s and ss", async () => {
			// Arrange
			const word = buildLowercaseWord();

			// Act
			const sharpId = await insertAuthRows.user({
				email: `straße${word}@example.com`,
			});
			const doubleId = await insertAuthRows.user({
				email: `strasse${word}@example.com`,
			});

			// Assert
			expect(sharpId).not.toBe(doubleId);
		});
	});

	// Ce que la collation confond en plus de la casse : la règle de format de l'email doit refuser ces caractères
	describe("characters the email format must refuse", () => {
		it.each([
			{ reason: "a fullwidth letter", variant: "ａlex" },
			{ reason: "a ligature", variant: "ﬁle" },
			{ reason: "an invisible character", variant: "al​ex" },
		])(
			"SHOULD treat the email as an existing one WHEN it differs by $reason",
			async ({ variant }) => {
				// Arrange
				const word = buildLowercaseWord();
				const plain = variant.normalize("NFKC").replace("​", "");
				await insertAuthRows.user({ email: `${plain}${word}@example.com` });

				// Act
				const insertion = insertAuthRows.user({
					email: `${variant}${word}@example.com`,
				});

				// Assert
				await expect(insertion).rejects.toThrow(UniqueConstraintError);
			},
		);
	});

	describe("username", () => {
		it("SHOULD accept both usernames WHEN they differ only by case", async () => {
			// Arrange
			const word = buildLowercaseWord();

			// Act
			const capitalizedId = await insertAuthRows.user({
				username: `Alex${word}`,
			});
			const lowercaseId = await insertAuthRows.user({
				username: `alex${word}`,
			});

			// Assert
			expect((await selectAuthRows.user(capitalizedId))?.username).toBe(
				`Alex${word}`,
			);
			expect((await selectAuthRows.user(lowercaseId))?.username).toBe(
				`alex${word}`,
			);
		});

		it("SHOULD refuse a username WHEN an account already has it with the same case", async () => {
			// Arrange
			const word = buildLowercaseWord();
			await insertAuthRows.user({ username: `Alex${word}` });

			// Act
			const insertion = insertAuthRows.user({ username: `Alex${word}` });

			// Assert
			await expect(insertion).rejects.toThrow(UniqueConstraintError);
		});
	});

	describe("other columns", () => {
		it("SHOULD allow both login methods and leave the optional columns empty WHEN only the required ones are given", async () => {
			// Arrange
			const word = buildLowercaseWord();
			const passwordChangedAt = new Date("2026-11-02T10:00:00.123Z");

			// Act
			const id = await insertAuthRows.user({
				email: `${word}@example.com`,
				username: word,
				passwordHash: "argon2id:m=19456,t=2,p=1:c2Vs:aGFzaA",
				passwordChangedAt,
			});

			// Assert
			expect(await selectAuthRows.user(id)).toStrictEqual({
				id,
				email: `${word}@example.com`,
				username: word,
				displayName: null,
				passwordHash: "argon2id:m=19456,t=2,p=1:c2Vs:aGFzaA",
				passwordChangedAt,
				loginMethods: "both",
				lastLoginAt: null,
				lastSeenAt: null,
			});
		});

		it("SHOULD refuse a login method WHEN it is neither mail, password nor both", async () => {
			// Arrange
			const id = await insertAuthRows.user();

			// Act
			const update = sequelize.query(
				"UPDATE auth_user SET login_methods = 'sms' WHERE id = :id",
				{ replacements: { id } },
			);

			// Assert
			await expect(update).rejects.toThrow(DatabaseError);
		});
	});
});
