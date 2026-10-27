import { describe, expect, it } from "vitest";

import type { IgdbVersionGame } from "../../igdb/type/igdbVersionGame.type.ts";
import { getIgdbVersionTitle } from "./getIgdbVersionTitle.ts";

const GAME_NAME = "Final Fantasy VII";
// 1998-06-24 à 00:00 UTC
const RELEASE_1998 = 898646400;

function buildVersion(version: Partial<IgdbVersionGame>): IgdbVersionGame {
	return { id: 2, name: GAME_NAME, url: "https://www.igdb.com", ...version };
}

describe("getIgdbVersionTitle.ts", () => {
	describe("own title", () => {
		it("SHOULD use the version title WHEN IGDB gives one", () => {
			expect(
				getIgdbVersionTitle(
					buildVersion({ version_title: " Steam Edition " }),
					GAME_NAME,
				),
			).toBe("Steam Edition");
		});

		it("SHOULD use the version name WHEN it differs from the game name", () => {
			expect(
				getIgdbVersionTitle(
					buildVersion({ name: "Final Fantasy VII Remastered" }),
					GAME_NAME,
				),
			).toBe("Final Fantasy VII Remastered");
		});
	});

	describe("same name as the game", () => {
		it("SHOULD use the type and the year of the first release", () => {
			expect(
				getIgdbVersionTitle(
					buildVersion({
						game_type: { type: "Port" },
						release_dates: [{ date: RELEASE_1998 }],
					}),
					GAME_NAME,
				),
			).toBe("Portage 1998");
		});

		it("SHOULD call it an edition WHEN the type is not a version type", () => {
			expect(
				getIgdbVersionTitle(
					buildVersion({ game_type: { type: "Main Game" } }),
					GAME_NAME,
				),
			).toBe("Édition");
		});
	});
});
