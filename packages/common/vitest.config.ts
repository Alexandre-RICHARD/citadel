import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		passWithNoTests: true,
		projects: [
			{
				extends: true,
				test: {
					name: "universal",
					environment: "node",
					include: ["src/universal/**/*.unit.test.ts"],
				},
			},
			{
				extends: true,
				test: {
					name: "browser",
					environment: "jsdom",
					include: [
						"src/browser/**/*.unit.test.ts",
						"src/react/**/*.unit.test.tsx",
					],
					setupFiles: ["vitest.setup.ts"],
				},
			},
		],
	},
});
