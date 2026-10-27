import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useActiveIndex } from "./useActiveIndex.tsx";

describe("useActiveIndex.tsx", () => {
	describe("initial value", () => {
		it("SHOULD start with no active result", () => {
			const { result } = renderHook(() => useActiveIndex("zelda"));

			expect(result.current[0]).toBe(-1);
		});
	});

	describe("reset", () => {
		it("SHOULD keep the active result WHEN the reset key does not change", () => {
			const { result, rerender } = renderHook(
				({ resetKey }) => useActiveIndex(resetKey),
				{ initialProps: { resetKey: "zelda" } },
			);

			act(() => {
				result.current[1](2);
			});
			rerender({ resetKey: "zelda" });

			expect(result.current[0]).toBe(2);
		});

		it("SHOULD clear the active result WHEN the reset key changes", () => {
			const { result, rerender } = renderHook(
				({ resetKey }) => useActiveIndex(resetKey),
				{ initialProps: { resetKey: "zelda" } },
			);

			act(() => {
				result.current[1](2);
			});
			rerender({ resetKey: "mario" });

			expect(result.current[0]).toBe(-1);
		});
	});
});
