import { describe, expect, it, vi } from "vitest";

import { blurOnEnter } from "./blurOnEnter.ts";

describe("blurOnEnter.ts", () => {
	describe("keys", () => {
		it("SHOULD leave the field WHEN the key is Enter", () => {
			const blur = vi.fn();

			blurOnEnter({ key: "Enter", currentTarget: { blur } });

			expect(blur).toHaveBeenCalledOnce();
		});

		it("SHOULD stay in the field WHEN the key is another one", () => {
			const blur = vi.fn();

			blurOnEnter({ key: "a", currentTarget: { blur } });

			expect(blur).not.toHaveBeenCalled();
		});
	});
});
