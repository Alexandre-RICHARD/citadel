import { afterEach, describe, expect, it, vi } from "vitest";

import { getFocusableElements } from "./getFocusableElements.ts";

// jsdom ne calcule aucune mise en page : un élément « affiché » doit simuler ses rectangles
function render(html: string): HTMLElement {
	const container = document.createElement("div");
	container.innerHTML = html;
	document.body.append(container);
	return container;
}

function markAsDisplayed(container: HTMLElement): void {
	container.querySelectorAll<HTMLElement>("*").forEach((element) => {
		if (element.dataset.hidden === undefined)
			vi.spyOn(element, "getClientRects").mockReturnValue([
				new DOMRect(),
			] as unknown as DOMRectList);
	});
}

function getIds(elements: HTMLElement[]): string[] {
	return elements.map(({ id }) => id);
}

describe("getFocusableElements.ts", () => {
	afterEach(() => {
		document.body.innerHTML = "";
		vi.restoreAllMocks();
	});

	describe("focusable elements", () => {
		it("SHOULD return links, enabled fields, buttons and tabindex elements, in document order", () => {
			const container = render(`
				<a id="link" href="/"></a>
				<button id="button"></button>
				<input id="input" />
				<select id="select"></select>
				<textarea id="textarea"></textarea>
				<div id="tabbable" tabindex="0"></div>
			`);
			markAsDisplayed(container);

			expect(getIds(getFocusableElements(container))).toStrictEqual([
				"link",
				"button",
				"input",
				"select",
				"textarea",
				"tabbable",
			]);
		});
	});

	describe("skipped elements", () => {
		it("SHOULD skip disabled fields, links without href and tabindex -1", () => {
			const container = render(`
				<a id="anchor"></a>
				<button id="disabled" disabled></button>
				<div id="untabbable" tabindex="-1"></div>
				<button id="kept"></button>
			`);
			markAsDisplayed(container);

			expect(getIds(getFocusableElements(container))).toStrictEqual(["kept"]);
		});

		it("SHOULD skip the elements inside an inert block", () => {
			const container = render(`
				<div inert><button id="inert"></button></div>
				<button id="kept"></button>
			`);
			markAsDisplayed(container);

			expect(getIds(getFocusableElements(container))).toStrictEqual(["kept"]);
		});

		it("SHOULD skip the elements that are not displayed", () => {
			const container = render(`
				<button id="hidden" data-hidden></button>
				<button id="kept"></button>
			`);
			markAsDisplayed(container);

			expect(getIds(getFocusableElements(container))).toStrictEqual(["kept"]);
		});
	});
});
