import { describe, expect, it } from "vitest";

import { footerPages } from "../content/footerPages";
import { resolveHomepageView } from "./resolveHomepageView";
import { showcaseProjects } from "./showcaseProjects";

describe("resolveHomepageView.ts", () => {
	describe("welcome", () => {
		it("SHOULD show the welcome text WHEN the address has no slug", () => {
			expect(
				resolveHomepageView(undefined, showcaseProjects, footerPages),
			).toEqual({
				kind: "welcome",
			});
		});
	});

	describe("project", () => {
		it("SHOULD select the project WHEN the slug is its path", () => {
			const view = resolveHomepageView(
				"game-death-counter",
				showcaseProjects,
				footerPages,
			);

			expect(view.kind === "project" && view.project.name).toBe(
				"Game Death Counter",
			);
		});
	});

	describe("footer page", () => {
		it("SHOULD show the footer page WHEN the slug is its own", () => {
			const view = resolveHomepageView(
				"mentions-legales",
				showcaseProjects,
				footerPages,
			);

			expect(view.kind === "page" && view.page.title).toBe("Mentions légales");
		});
	});

	describe("unknown", () => {
		it("SHOULD flag the address WHEN the slug matches nothing", () => {
			expect(
				resolveHomepageView("nowhere", showcaseProjects, footerPages),
			).toEqual({
				kind: "unknown",
			});
		});

		it("SHOULD flag the address WHEN the slug is the homepage itself", () => {
			expect(
				resolveHomepageView("homepage", showcaseProjects, footerPages),
			).toEqual({
				kind: "unknown",
			});
		});
	});
});
