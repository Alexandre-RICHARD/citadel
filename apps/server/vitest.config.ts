import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["src/**/*.unit.test.ts"],
		exclude: ["src/todo_folder/**"],
		setupFiles: ["vitestSetup.ts"],
		passWithNoTests: true,
	},
});
