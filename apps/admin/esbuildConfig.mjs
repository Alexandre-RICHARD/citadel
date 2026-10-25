import { build } from "esbuild";

// Le serveur de la console en un seul fichier, comme celui du site : l'image n'a besoin
// ni de pnpm ni de node_modules. hashPassword : l'outil qui fabrique ADMIN_PASSWORD_HASH,
// lancé par `citadel admin-password` depuis la même image.
await build({
	entryPoints: {
		"build.admin": "src/server/index.ts",
		"hashPassword": "src/server/auth/hashPasswordCli.ts",
	},
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
});
