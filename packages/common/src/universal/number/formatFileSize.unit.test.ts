import { describe, expect, it } from "vitest";

import { formatFileSize } from "./formatFileSize.ts";

describe("formatFileSize.ts", () => {
	describe("base 1000", () => {
		it.each([
			[1, "1 o"],
			[999, "999 o"],
			[1_000, "1 ko"],
			[1_100, "1,1 ko"],
			[1_012, "1,01 ko"],
			[1_123, "1,12 ko"],
			[99_994, "99,99 ko"],
			[100_123, "100 ko"],
			[999_499, "999 ko"],
			[1_012_000, "1,01 Mo"],
			[99_994_999, "99,99 Mo"],
			[1_123_000_000, "1,12 Go"],
			[1_100_000_000_000, "1,1 To"],
		])(
			"SHOULD show at most three significant digits WHEN given %i bytes",
			(bytes, expected) => {
				expect(formatFileSize(bytes)).toBe(expected);
			},
		);

		it.each([
			[99_995, "100 ko"],
			[999_500, "1 Mo"],
			[999_999_999, "1 Go"],
			[999_500_000_000, "1 To"],
		])(
			"SHOULD switch to the rounded value or the next unit WHEN %i bytes round up",
			(bytes, expected) => {
				expect(formatFileSize(bytes)).toBe(expected);
			},
		);

		// fr-FR sépare les milliers par une espace fine insécable
		it("SHOULD stay in terabytes WHEN there is no bigger unit", () => {
			expect(formatFileSize(1_500_000_000_000_000)).toBe("1\u202F500 To");
		});
	});

	describe("base 1024", () => {
		it.each([
			[1_536, "1,5 Kio"],
			[512 * 1024 ** 2, "512 Mio"],
			[5 * 1024 ** 3, "5 Gio"],
		])("SHOULD use binary units WHEN given %i bytes", (bytes, expected) => {
			expect(formatFileSize(bytes, 1024)).toBe(expected);
		});

		it("SHOULD switch to the next unit WHEN the value has four digits", () => {
			expect(formatFileSize(1000 * 1024 ** 2, 1024)).toBe("0,98 Gio");
		});
	});

	describe("empty size", () => {
		it.each([0, -5])("SHOULD show zero bytes WHEN given %i", (bytes) => {
			expect(formatFileSize(bytes)).toBe("0 o");
		});
	});
});
