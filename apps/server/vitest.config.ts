import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["src/**/*.unit.test.ts"],
		setupFiles: ["vitest.setup.ts"],
		passWithNoTests: true,
	},
});
