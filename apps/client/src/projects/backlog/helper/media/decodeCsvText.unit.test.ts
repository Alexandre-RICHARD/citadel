import { describe, expect, it } from "vitest";

import { decodeCsvText } from "./decodeCsvText";

describe("decodeCsvText.ts", () => {
	describe("encodings", () => {
		it("SHOULD read UTF-8 as is", () => {
			const bytes = new TextEncoder().encode("603;série");
			expect(decodeCsvText(bytes.buffer)).toBe("603;série");
		});

		it("SHOULD fall back to Windows-1252 WHEN the bytes are not UTF-8", () => {
			const bytes = new Uint8Array([54, 48, 51, 59, 115, 0xe9, 114, 105, 101]);
			expect(decodeCsvText(bytes.buffer)).toBe("603;série");
		});
	});
});
