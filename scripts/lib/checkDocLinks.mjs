// Vérifie les liens relatifs et les ancres du README, de CLAUDE.md et de docs/ : un fichier qui n'existe pas, ou un titre
// (ancre) qui n'existe pas dans le fichier visé. Les liens externes ne sont pas testés (voir checkExternalLinks.sh).
// Appelé par scripts/checkDocLinks.sh, depuis la racine du dépôt.
import fs from "node:fs";
import path from "node:path";

// Même règle que GitHub : minuscules, ponctuation retirée, espaces remplacés par des tirets
function slugify(title) {
	return title
		.toLowerCase()
		.replace(/[`*]/g, "")
		.replace(/[^\p{L}\p{N}\s_-]/gu, "")
		.trim()
		.replace(/\s/g, "-");
}

// Les titres hors blocs de code : un « # » dans un bloc de code n'est pas un titre
function readAnchors(file) {
	const anchors = new Set();
	let inFence = false;
	for (const line of fs.readFileSync(file, "utf8").split("\n")) {
		if (/^\s*```/.test(line)) inFence = !inFence;
		const heading = !inFence && line.match(/^#{1,6}\s+(.*)/);
		if (heading) anchors.add(slugify(heading[1]));
	}
	return anchors;
}

function listMarkdownFiles() {
	const docs = fs
		.readdirSync("docs", { recursive: true })
		.filter((file) => file.endsWith(".md"))
		.map((file) => path.join("docs", file));
	return ["README.md", "CLAUDE.md", ...docs];
}

const files = listMarkdownFiles();
const anchorsByFile = new Map(files.map((file) => [path.resolve(file), readAnchors(file)]));
let brokenCount = 0;

for (const file of files) {
	const text = fs.readFileSync(file, "utf8");
	for (const match of text.matchAll(/\]\(([^)\s]+)\)/g)) {
		const link = match[1];
		if (/^(https?:|mailto:)/.test(link)) continue;
		const [linkPath, anchor] = link.split("#");
		const target = linkPath ? path.resolve(path.dirname(file), linkPath) : path.resolve(file);
		let problem = null;
		if (!fs.existsSync(target)) problem = "fichier introuvable";
		else if (anchor && target.endsWith(".md") && !(anchorsByFile.get(target) ?? readAnchors(target)).has(anchor))
			problem = "ancre introuvable";
		if (problem) {
			console.log(`${file} : ${link} (${problem})`);
			brokenCount += 1;
		}
	}
}

console.log(brokenCount === 0 ? `Liens de la documentation : aucun lien cassé (${files.length} fichiers).` : `${brokenCount} lien(s) cassé(s).`);
process.exit(brokenCount === 0 ? 0 : 1);
