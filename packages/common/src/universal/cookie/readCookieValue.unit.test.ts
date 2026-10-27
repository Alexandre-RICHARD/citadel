import { describe, expect, it } from "vitest";

import { readCookieValue } from "./readCookieValue.ts";

describe("readCookieValue.ts", () => {
	describe("present cookie", () => {
		it("SHOULD return the value of the named cookie", () => {
			expect(readCookieValue("a=1; session=abc; b=2", "session")).toBe("abc");
		});

		it("SHOULD decode the value", () => {
			expect(readCookieValue("name=Jo%C3%A9%3B", "name")).toBe("Joé;");
		});

		it("SHOULD keep the raw value WHEN it is not valid URI encoding", () => {
			expect(readCookieValue("name=100%", "name")).toBe("100%");
		});

		it("SHOULD keep the equal signs of the value", () => {
			expect(readCookieValue("token=a=b==", "token")).toBe("a=b==");
		});
	});

	describe("missing cookie", () => {
		it.each([
			{ reason: "no cookie has the name", header: "sessionId=abc" },
			{ reason: "the header is empty", header: "" },
			{ reason: "there is no header", header: undefined },
			{ reason: "the pair has no equal sign", header: "session" },
			{
				reason: "a name only starts like the wanted one",
				header: "sessionx=1",
			},
		])("SHOULD return undefined WHEN $reason", ({ header }) => {
			expect(readCookieValue(header, "session")).toBeUndefined();
		});
	});
});
