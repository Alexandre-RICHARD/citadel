import { describe, expect, it } from "vitest";

import { findProjectByPathname } from "./findProjectByPathname";
import { ProjectsEnum } from "./projects.enum";

describe("findProjectByPathname.ts", () => {
	describe("known project", () => {
		it("SHOULD find the project WHEN the address is its path", () => {
			expect(findProjectByPathname("/backlog")?.id).toBe(ProjectsEnum.Backlog);
		});

		it("SHOULD find the project WHEN the address goes deeper than its path", () => {
			expect(findProjectByPathname("/homepage/backlog")?.id).toBe(
				ProjectsEnum.Homepage,
			);
		});
	});

	describe("unknown address", () => {
		it("SHOULD find nothing WHEN the first segment is no project path", () => {
			expect(findProjectByPathname("/inconnu/backlog")).toBeUndefined();
		});

		it("SHOULD find nothing WHEN the address is the root", () => {
			expect(findProjectByPathname("/")).toBeUndefined();
		});
	});
});
