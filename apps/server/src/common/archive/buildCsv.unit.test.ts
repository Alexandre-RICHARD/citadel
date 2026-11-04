import { describe, expect, it } from "vitest";

import { buildCsv } from "./buildCsv.ts";

const BOM = "﻿";

describe("buildCsv.ts", () => {
	describe("layout", () => {
		it("SHOULD write the headers then one CRLF-terminated line per row, after a BOM", () => {
			expect(
				buildCsv(
					["id", "name"],
					[
						[1, "Elden Ring"],
						[2, "Hades"],
					],
				),
			).toBe(`${BOM}id,name\r\n1,Elden Ring\r\n2,Hades\r\n`);
		});

		it("SHOULD write only the headers WHEN there is no row", () => {
			expect(buildCsv(["id"], [])).toBe(`${BOM}id\r\n`);
		});
	});

	describe("cells", () => {
		it("SHOULD write an ISO date, an empty cell for null and undefined, and true or false", () => {
			expect(
				buildCsv(
					["date", "none", "missing", "flag"],
					[[new Date("2026-11-03T10:00:00.000Z"), null, undefined, true]],
				),
			).toBe(
				`${BOM}date,none,missing,flag\r\n2026-11-03T10:00:00.000Z,,,true\r\n`,
			);
		});

		it("SHOULD quote a cell with a comma, a quote or a line break, and double the quotes", () => {
			expect(
				buildCsv(["text"], [["a,b"], ['dit "oui"'], ["deux\nlignes"]]),
			).toBe(`${BOM}text\r\n"a,b"\r\n"dit ""oui"""\r\n"deux\nlignes"\r\n`);
		});

		it("SHOULD keep accents and emojis as they are", () => {
			expect(buildCsv(["name"], [["Élodie 🎮"]])).toBe(
				`${BOM}name\r\nÉlodie 🎮\r\n`,
			);
		});

		it.each(["=1+1", "+33", "-2", "@SUM(A1)"])(
			"SHOULD neutralise the formula %s with a leading quote",
			(formula) => {
				expect(buildCsv(["text"], [[formula]])).toBe(
					`${BOM}text\r\n'${formula}\r\n`,
				);
			},
		);

		it("SHOULD keep a negative number, which is not a formula", () => {
			expect(buildCsv(["n"], [[-2]])).toBe(`${BOM}n\r\n-2\r\n`);
		});
	});
});
