import { describe, expect, it } from "vitest";

import { parseFolderName } from "./parseFolderName.ts";

describe("parseFolderName.ts", () => {
	describe("title and year", () => {
		it("SHOULD read « Titre (année) »", () => {
			expect(parseFolderName("Ça (2017) {tmdb-346364}")).toStrictEqual({
				title: "Ça",
				year: 2017,
			});
		});
	});

	describe("title only", () => {
		it("SHOULD keep the whole name WHEN there is no year", () => {
			expect(parseFolderName("The Office")).toStrictEqual({
				title: "The Office",
				year: null,
			});
		});
	});
});
