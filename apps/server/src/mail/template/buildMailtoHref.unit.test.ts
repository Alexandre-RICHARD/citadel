import { describe, expect, it } from "vitest";

import { buildMailtoHref } from "./buildMailtoHref.ts";

describe("buildMailtoHref.ts", () => {
	describe("link", () => {
		it("SHOULD encode the address and the subject WHEN they contain special characters", () => {
			expect(buildMailtoHref("sam+test@example.com", "Re: Tom & Jerry ?")).toBe(
				"mailto:sam%2Btest%40example.com?subject=Re%3A%20Tom%20%26%20Jerry%20%3F",
			);
		});
	});
});
