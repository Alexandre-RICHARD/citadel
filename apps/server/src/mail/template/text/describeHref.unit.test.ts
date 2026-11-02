import { describe, expect, it } from "vitest";

import { describeHref } from "./describeHref.ts";

describe("describeHref.ts", () => {
	describe("plain text link", () => {
		it("SHOULD keep only the decoded address WHEN the link opens a new mail", () => {
			expect(
				describeHref("mailto:sam%2Btest%40example.com?subject=Re%3A%20Salut"),
			).toBe("sam+test@example.com");
		});

		it("SHOULD keep the whole URL WHEN the link opens a page", () => {
			expect(describeHref("https://app.brevo.com")).toBe(
				"https://app.brevo.com",
			);
		});
	});
});
