import { build } from "esbuild";

await build({
	entryPoints: ["src/index.ts"],
	outfile: "build/build.server.cjs",
	bundle: true,
	platform: "node",
	format: "cjs",
	target: "node22",
	packages: "bundle",
	minify: true,
	sourcemap: true,
	sourcesContent: false,

	plugins: [
		{
			name: "ignore-optional-sequelize",
			setup(build) {
				build.onResolve(
					{ filter: /(pg-hstore|pg|mysql2|sqlite3|tedious)$/ },
					() => ({
						path: "noop",
						namespace: "ignore",
					}),
				);

				build.onLoad({ filter: /.*/, namespace: "ignore" }, () => ({
					contents: "export default {};",
					loader: "js",
				}));
			},
		},
	],
});
