import { regexDictionary } from "@citadel/common/src/universal/regex/regexDictionary.ts";
import { build } from "esbuild";

await build({
	// Le serveur, et la commande « après restauration » que citadel restore-db lance dans la même image
	entryPoints: [
		{ in: "src/index.ts", out: "build.server" },
		{ in: "src/afterRestore.ts", out: "afterRestore" },
	],
	outdir: "build",
	outExtension: { ".js": ".cjs" },
	bundle: true,
	platform: "node",
	format: "cjs",
	target: "node24",
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
