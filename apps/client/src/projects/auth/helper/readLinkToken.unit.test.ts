import { describe, expect, it } from "vitest";

import { readLinkToken } from "./readLinkToken";

const TOKEN = "Zm9vYmFyLWJhei1xdXV4LWNvcmdlLWdyYXVsdC1nYXJ";

describe("readLinkToken.ts", () => {
	describe("readable links", () => {
		it("SHOULD give the token WHEN the fragment holds it", () => {
			expect(readLinkToken(`#${TOKEN}`)).toBe(TOKEN);
		});
	});

	describe("damaged links", () => {
		it.each([
			{ reason: "there is no fragment", hash: "" },
			{ reason: "the token is cut", hash: `#${TOKEN.slice(0, 30)}` },
			{ reason: "something follows the token", hash: `#${TOKEN}&utm=1` },
		])("SHOULD give null WHEN $reason", ({ hash }) => {
			expect(readLinkToken(hash)).toBeNull();
		});
	});
});
