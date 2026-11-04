import { crc32 } from "node:zlib";

import { describe, expect, it } from "vitest";

import { readStoredZip } from "../../testUtils/zip/readStoredZip.ts";
import { buildStoredZip } from "./buildStoredZip.ts";

const DATE = new Date("2026-11-03T10:20:30.000Z");

describe("buildStoredZip.ts", () => {
	describe("content", () => {
		it("SHOULD give back every file with its name and its text, accents included", () => {
			// Act
			const zip = buildStoredZip(
				[
					{ name: "auth_user.csv", content: "id,name\r\n1,Élodie 🎮\r\n" },
					{ name: "auth_event.csv", content: "id\r\n" },
				],
				DATE,
			);

			// Assert
			expect(
				readStoredZip(zip).map(({ name, content }) => ({ name, content })),
			).toStrictEqual([
				{ name: "auth_user.csv", content: "id,name\r\n1,Élodie 🎮\r\n" },
				{ name: "auth_event.csv", content: "id\r\n" },
			]);
		});

		it("SHOULD write the CRC-32 of each file", () => {
			// Act
			const zip = buildStoredZip(
				[{ name: "a.csv", content: "123456789" }],
				DATE,
			);

			// Assert
			expect(readStoredZip(zip)[0]?.checksum).toBe(crc32("123456789"));
			expect(readStoredZip(zip)[0]?.checksum).toBe(0xcbf43926);
		});

		it("SHOULD write an empty but valid archive WHEN there is no file", () => {
			expect(readStoredZip(buildStoredZip([], DATE))).toStrictEqual([]);
		});
	});

	describe("format", () => {
		it("SHOULD store the files without compression, with UTF-8 names, at the given date", () => {
			// Act
			const zip = buildStoredZip([{ name: "é.csv", content: "x" }], DATE);

			// Assert
			expect(zip.readUInt16LE(6)).toBe(0x0800);
			expect(zip.readUInt16LE(8)).toBe(0);
			expect(zip.readUInt16LE(10)).toBe((10 << 11) | (20 << 5) | 15);
			expect(zip.readUInt16LE(12)).toBe(((2026 - 1980) << 9) | (11 << 5) | 3);
			expect(zip.readUInt32LE(18)).toBe(zip.readUInt32LE(22));
		});
	});
});
