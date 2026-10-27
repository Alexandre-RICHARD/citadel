import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useScrollIntoView } from "./useScrollIntoView.tsx";

// jsdom ne fait pas défiler : on vérifie seulement l'appel
function addElement(id: string) {
	const scrollIntoView = vi.fn();
	const element = document.createElement("li");
	element.id = id;
	element.scrollIntoView = scrollIntoView;
	document.body.append(element);
	return scrollIntoView;
}

describe("useScrollIntoView.tsx", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	describe("active element", () => {
		it("SHOULD scroll the element into view, as little as needed", () => {
			const scrollIntoView = addElement("result-2");

			renderHook(() => useScrollIntoView("result-2"));

			expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
		});

		it("SHOULD scroll again WHEN the active element changes", () => {
			addElement("result-1");
			const scrollSecondIntoView = addElement("result-2");
			const { rerender } = renderHook(({ id }) => useScrollIntoView(id), {
				initialProps: { id: "result-1" },
			});

			rerender({ id: "result-2" });

			expect(scrollSecondIntoView).toHaveBeenCalledOnce();
		});
	});

	describe("no element", () => {
		it.each([
			{ reason: "there is no active element", id: undefined },
			{ reason: "the element is not in the page", id: "missing" },
		])("SHOULD do nothing WHEN $reason", ({ id }) => {
			expect(() => renderHook(() => useScrollIntoView(id))).not.toThrow();
		});
	});
});
