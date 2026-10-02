import { describe, expect, it } from "vitest";

import { generateUuid } from "./generateUuid.ts";

describe("generateUuid.ts", () => {
	describe("format", () => {
		it("SHOULD return 5 groups of 8, 4, 4, 4 and 12 lowercase hexadecimal characters", () => {
			const groups = generateUuid().split("-");

			expect(groups.map((group) => group.length)).toStrictEqual([
				8, 4, 4, 4, 12,
			]);
			for (const character of groups.join("")) {
				expect("0123456789abcdef").toContain(character);
			}
		});

		it("SHOULD be a version 4 UUID", () => {
			const uuid = generateUuid();

			expect(uuid[14]).toBe("4");
			expect("89ab").toContain(uuid[19]);
		});
	});

	describe("uniqueness", () => {
		it("SHOULD return a different value on each call", () => {
			const uuids = new Set(Array.from({ length: 100 }, () => generateUuid()));

			expect(uuids.size).toBe(100);
		});
	});
});
