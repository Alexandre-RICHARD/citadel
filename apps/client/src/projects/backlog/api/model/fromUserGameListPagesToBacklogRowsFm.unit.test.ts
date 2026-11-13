import { describe, expect, it } from "vitest";

import { buildUserGameDto } from "../testUtils/buildUserGameDto";
import { buildUserGameListData } from "../testUtils/buildUserGameListData";
import { fromUserGameListPagesToBacklogRowsFm } from "./fromUserGameListPagesToBacklogRowsFm";

describe("fromUserGameListPagesToBacklogRowsFm.ts", () => {
	describe("empty view", () => {
		it("SHOULD return no row WHEN the API answered 204", () => {
			expect(
				fromUserGameListPagesToBacklogRowsFm(buildUserGameListData([null], 0)),
			).toStrictEqual({ rows: [], matchedCount: 0 });
		});
	});

	describe("unchanged games", () => {
		it("SHOULD give the very same row object WHEN the game is the same object as in the previous call", () => {
			const userGame = buildUserGameDto(1);

			const [first] = fromUserGameListPagesToBacklogRowsFm(
				buildUserGameListData([[userGame]], 1),
			).rows;
			const [second] = fromUserGameListPagesToBacklogRowsFm(
				buildUserGameListData([[userGame, buildUserGameDto(2)]], 2),
			).rows;

			expect(second).toBe(first);
		});

		it("SHOULD build a new row WHEN the game is a new object", () => {
			const [first] = fromUserGameListPagesToBacklogRowsFm(
				buildUserGameListData([[buildUserGameDto(1)]], 1),
			).rows;
			const [second] = fromUserGameListPagesToBacklogRowsFm(
				buildUserGameListData([[buildUserGameDto(1)]], 1),
			).rows;

			expect(second).not.toBe(first);
			expect(second).toStrictEqual(first);
		});
	});

	describe("pages", () => {
		it("SHOULD chain the rows of every loaded page and keep the total of the view", () => {
			const rows = fromUserGameListPagesToBacklogRowsFm(
				buildUserGameListData(
					[[buildUserGameDto(1), buildUserGameDto(2)], [buildUserGameDto(3)]],
					30,
				),
			);

			expect(rows.rows.map(({ gameId }) => gameId)).toStrictEqual([1, 2, 3]);
			expect(rows.matchedCount).toBe(30);
		});

		it("SHOULD keep only the first place of a game WHEN an optimistic row comes back in a later page", () => {
			const rows = fromUserGameListPagesToBacklogRowsFm(
				buildUserGameListData(
					[
						[buildUserGameDto(3), buildUserGameDto(1)],
						[buildUserGameDto(3), buildUserGameDto(2)],
					],
					3,
				),
			);

			expect(rows.rows.map(({ gameId }) => gameId)).toStrictEqual([3, 1, 2]);
		});
	});
});
