import { describe, expect, it } from "vitest";

import { QueueFullError } from "../../universal/limit/QueueFullError.ts";
import { createPasswordHasher } from "./createPasswordHasher.ts";
import { TEST_ARGON2_PARAMETERS } from "./testArgon2Parameters.ts";

const PASSWORD = "une phrase de passe assez longue";

describe("createPasswordHasher.ts", () => {
	describe("hash and verify", () => {
		it("SHOULD verify the password it hashed WHEN under the limits", async () => {
			// Arrange
			const hasher = createPasswordHasher({
				parameters: TEST_ARGON2_PARAMETERS,
				concurrency: 2,
				queueMax: 20,
			});

			// Act
			const storedHash = await hasher.hash(PASSWORD);

			// Assert
			expect(await hasher.verify(PASSWORD, storedHash)).toBe(true);
			expect(hasher.needsRehash(storedHash)).toBe(false);
		});

		it("SHOULD hash every password in turn WHEN more arrive than the concurrency", async () => {
			// Arrange
			const hasher = createPasswordHasher({
				parameters: TEST_ARGON2_PARAMETERS,
				concurrency: 1,
				queueMax: 2,
			});

			// Act
			const storedHashes = await Promise.all([
				hasher.hash("premier mot de passe"),
				hasher.hash("deuxième mot de passe"),
				hasher.hash("troisième mot de passe"),
			]);

			// Assert
			expect(new Set(storedHashes).size).toBe(3);
		});
	});

	describe("full queue", () => {
		it("SHOULD refuse with a QueueFullError WHEN the queue is full", async () => {
			// Arrange
			const hasher = createPasswordHasher({
				parameters: TEST_ARGON2_PARAMETERS,
				concurrency: 1,
				queueMax: 1,
			});
			const accepted = [hasher.hash(PASSWORD), hasher.hash(PASSWORD)];

			// Act
			const refused = hasher.verify(PASSWORD, "argon2id:m=64,t=1,p=1:abc:def");

			// Assert
			await expect(refused).rejects.toBeInstanceOf(QueueFullError);
			await Promise.all(accepted);
		});
	});
});
