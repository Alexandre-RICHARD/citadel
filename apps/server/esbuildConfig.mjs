import { regexDictionary } from "@citadel/common/src/universal/regex/regexDictionary.ts";
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
					{ filter: regexDictionary.sequelizeUnusedDriver },
					() => ({
						path: "noop",
						namespace: "ignore",
					}),
				);

				build.onLoad(
					{ filter: regexDictionary.anyPath, namespace: "ignore" },
					() => ({
						contents: "export default {};",
						loader: "js",
					}),
				);
			},
		},
	],
});
