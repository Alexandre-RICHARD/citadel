import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		name: "@citadel/common:universal",
		environment: "node",
		include: ["src/universal/**/*.unit.test.ts"],
	},
});
