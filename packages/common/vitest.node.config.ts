import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		name: "@citadel/common:node",
		environment: "node",
		include: ["src/node/**/*.unit.test.ts"],
	},
});
