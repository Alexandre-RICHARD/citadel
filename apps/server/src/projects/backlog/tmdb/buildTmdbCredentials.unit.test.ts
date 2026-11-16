import { describe, expect, it } from "vitest";

import { buildTmdbCredentials } from "./buildTmdbCredentials.ts";

describe("buildTmdbCredentials.ts", () => {
	describe("kind of secret", () => {
		it("SHOULD send the read token as a bearer header WHEN the key is a JWT", () => {
			expect(
				buildTmdbCredentials("eyJhbGciOi.payload.signature"),
			).toStrictEqual({
				headers: { Authorization: "Bearer eyJhbGciOi.payload.signature" },
				query: {},
			});
		});

		it("SHOULD send the short API key in the query WHEN the key is not a JWT", () => {
			expect(buildTmdbCredentials("0123456789abcdef")).toStrictEqual({
				headers: {},
				query: { api_key: "0123456789abcdef" },
			});
		});
	});
});
