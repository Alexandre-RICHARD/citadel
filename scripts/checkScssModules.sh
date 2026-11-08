#!/usr/bin/env bash
# Liste les fichiers *.module.scss qu'aucun fichier .ts/.tsx n'importe.
# Ne vérifie pas que les classes du module sont utilisées.
# Usage : pnpm tools checkScssModules
#
# Tout se fait dans un seul processus Node : la version en bash lançait grep, sed et realpath pour chacun des
# milliers de fichiers, et sous Windows chaque processus coûte une dizaine de millisecondes (plusieurs minutes).

set -euo pipefail

cd "$(dirname "$0")/.."

node --input-type=module - <<'NODE'
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

// Mêmes alias que apps/client/vite.config.ts
const ALIASES = [
	["@styles/", "apps/client/src/styles/"],
	["@/", "apps/client/src/"],
];
const IGNORED_FOLDERS = new Set(["node_modules", "todo_folder", "build", "report"]);

// Tous les fichiers sous un dossier, hors dossiers ignorés
function listFiles(folder) {
	return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
		if (entry.isDirectory())
			return IGNORED_FOLDERS.has(entry.name) ? [] : listFiles(join(folder, entry.name));
		return [join(folder, entry.name)];
	});
}

const files = ["apps", "packages"].flatMap((folder) => listFiles(folder));

// Chemins absolus de tous les .module.scss importés
const imported = new Set();
const IMPORT = /from ['"]([^'"]+\.module\.scss)['"]/g;
for (const file of files.filter((name) => /\.tsx?$/.test(name))) {
	for (const [, specifier] of readFileSync(file, "utf8").matchAll(IMPORT)) {
		const alias = ALIASES.find(([prefix]) => specifier.startsWith(prefix));
		imported.add(
			alias === undefined
				? resolve(dirname(file), specifier)
				: resolve(alias[1], specifier.slice(alias[0].length)),
		);
	}
}

const unused = files
	.filter((name) => name.endsWith(".module.scss"))
	.filter((name) => !imported.has(resolve(name)))
	.sort();

for (const file of unused) console.log(`Non importé : ${file.replaceAll("\\", "/")}`);
if (unused.length === 0) console.log("Tous les .module.scss sont importés");
else {
	console.log(`${unused.length} .module.scss non importé(s)`);
	process.exitCode = 1;
}
NODE
