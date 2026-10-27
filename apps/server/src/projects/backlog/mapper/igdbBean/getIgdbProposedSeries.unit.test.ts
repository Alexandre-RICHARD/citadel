import { describe, expect, it } from "vitest";

import { getIgdbProposedSeries } from "./getIgdbProposedSeries.ts";

const ORIGINAL = { id: 1, name: "Crisis Core" };

describe("getIgdbProposedSeries.ts", () => {
	describe("collections", () => {
		it("SHOULD propose the widest collection, the one without a parent among them", () => {
			expect(
				getIgdbProposedSeries({
					...ORIGINAL,
					collections: [
						{
							id: 20,
							name: "Compilation of FF VII",
							as_child_relations: [{ parent_collection: 10 }],
						},
						{ id: 10, name: "Final Fantasy" },
					],
				}),
			).toStrictEqual({
				name: "Final Fantasy",
				igdbCollectionId: 10,
				igdbFranchiseId: null,
			});
		});

		it("SHOULD propose the first collection WHEN every one has a parent among them", () => {
			expect(
				getIgdbProposedSeries({
					...ORIGINAL,
					collections: [
						{
							id: 20,
							name: "A",
							as_child_relations: [{ parent_collection: 30 }],
						},
						{
							id: 30,
							name: "B",
							as_child_relations: [{ parent_collection: 20 }],
						},
					],
				})?.name,
			).toBe("A");
		});
	});

	describe("franchises", () => {
		it("SHOULD fall back on the main franchise WHEN there is no collection", () => {
			expect(
				getIgdbProposedSeries({
					...ORIGINAL,
					franchise: { id: 5, name: "Final Fantasy" },
					franchises: [{ id: 6, name: "Other" }],
				}),
			).toStrictEqual({
				name: "Final Fantasy",
				igdbCollectionId: null,
				igdbFranchiseId: 5,
			});
		});

		it("SHOULD fall back on the first franchise WHEN there is no main one", () => {
			expect(
				getIgdbProposedSeries({
					...ORIGINAL,
					franchises: [{ id: 6, name: "Other" }],
				})?.igdbFranchiseId,
			).toBe(6);
		});
	});

	describe("no series", () => {
		it("SHOULD propose nothing WHEN the game has neither collection nor franchise", () => {
			expect(getIgdbProposedSeries(ORIGINAL)).toBeNull();
		});
	});
});
