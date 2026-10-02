import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		include: ["src/**/*.test.ts?(x)"],
		exclude: ["src/todo_folder/**"],
		setupFiles: "vitest.setup.ts",
		passWithNoTests: true,
	},
});
