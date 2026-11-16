import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";
import { describe, expect, it } from "vitest";

import { parseMediaImportCsv } from "./parseMediaImportCsv";

describe("parseMediaImportCsv.ts", () => {
	describe("readable lines", () => {
		it("SHOULD read the id and the type, in French or English, whatever the separator and the order", () => {
			expect(
				parseMediaImportCsv(
					'tmdb,type\n603,film\r\n1396;Série\n"Show"\t1399\n\n27205,movie',
				),
			).toStrictEqual({
				entries: [
					{ mediaType: MediaTypeEnum.MOVIE, tmdbId: 603 },
					{ mediaType: MediaTypeEnum.SHOW, tmdbId: 1396 },
					{ mediaType: MediaTypeEnum.SHOW, tmdbId: 1399 },
					{ mediaType: MediaTypeEnum.MOVIE, tmdbId: 27205 },
				],
				invalidLines: [],
			});
		});

		it("SHOULD ignore the byte order mark that Excel writes", () => {
			expect(parseMediaImportCsv("﻿603,film").entries).toStrictEqual([
				{ mediaType: MediaTypeEnum.MOVIE, tmdbId: 603 },
			]);
		});
	});

	describe("unreadable lines", () => {
		it("SHOULD give their line number, but not the header", () => {
			expect(
				parseMediaImportCsv("id,type\n603,film\nabc,film\n604,livre\n605"),
			).toStrictEqual({
				entries: [{ mediaType: MediaTypeEnum.MOVIE, tmdbId: 603 }],
				invalidLines: [
					{ lineNumber: 3, text: "abc,film" },
					{ lineNumber: 4, text: "604,livre" },
					{ lineNumber: 5, text: "605" },
				],
			});
		});
	});
});
