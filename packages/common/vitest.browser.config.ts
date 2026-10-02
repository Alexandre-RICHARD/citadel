import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		name: "@citadel/common:browser",
		environment: "jsdom",
		include: ["src/browser/**/*.unit.test.ts", "src/react/**/*.unit.test.tsx"],
		setupFiles: ["vitestSetup.ts"],
	},
});
