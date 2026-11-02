import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		projects: [
			"vitest.universal.config.ts",
			"vitest.node.config.ts",
			"vitest.browser.config.ts",
		],
		passWithNoTests: true,
	},
});
