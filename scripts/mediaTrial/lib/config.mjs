// Arguments de la ligne de commande et variables du .env, lus une seule fois au lancement.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const repositoryRoot = path.resolve(import.meta.dirname, "../../..");

const usage = `Usage : pnpm tools mediaTrial [options]
  --short <fichier.txt>   liste courte d'identifiants TMDB (vérification 1)
  --list <fichier.xlsx>   export Excel de « NAS Multimédia » (vérifications 2, 3 et 4)
  --files <fichier.tsv>   liste des fichiers du NAS, produite par find (vérifications 3 et 4)
  --nas <hôte>            adresse du NAS sur le LAN ou par Tailscale (défaut : NAS_HOSTNAME du .env)
  --out <fichier.xlsx>    rapport, hors du dépôt (défaut : Téléchargements/media-trial-<date>.xlsx)`;

function parseArguments(argv) {
	const options = {};
	for (let index = 0; index < argv.length; index += 2) {
		const name = argv[index]?.replace(/^--/, "");
		const value = argv[index + 1];
		if (!["short", "list", "files", "nas", "out"].includes(name) || value === undefined) {
			throw new Error(`Argument inconnu ou sans valeur : ${argv[index]}\n\n${usage}`);
		}
		options[name] = value;
	}
	return options;
}

function defaultOutputPath() {
	const today = new Date().toISOString().slice(0, 10);
	// Le dossier Téléchargements de Windows peut être déplacé : à défaut de ~/Downloads, le dossier personnel
	const downloads = path.join(os.homedir(), "Downloads");
	return path.join(fs.existsSync(downloads) ? downloads : os.homedir(), `media-trial-${today}.xlsx`);
}

// Le rapport contient des noms de torrents et de trackers : il ne doit jamais atterrir dans le dépôt
function assertOutsideRepository(file) {
	const relative = path.relative(repositoryRoot, path.resolve(file));
	if (!relative.startsWith("..") && !path.isAbsolute(relative)) {
		throw new Error(`Le rapport doit être écrit hors du dépôt : ${file}`);
	}
}

function assertReadable(file, option) {
	if (file !== undefined && !fs.existsSync(file)) throw new Error(`--${option} : fichier introuvable : ${file}`);
}

function loadEnvironment() {
	const envFile = path.join(repositoryRoot, ".env");
	if (fs.existsSync(envFile)) process.loadEnvFile(envFile);
}

export function readConfig(argv) {
	loadEnvironment();
	const options = parseArguments(argv);
	if (!options.short && !options.list) throw new Error(`Rien à vérifier : donnez --short, --list ou les deux.\n\n${usage}`);
	for (const option of ["short", "list", "files"]) assertReadable(options[option], option);
	const output = options.out ?? defaultOutputPath();
	assertOutsideRepository(output);
	return {
		shortListFile: options.short,
		mediaListFile: options.list,
		fileListFile: options.files,
		nasHost: options.nas ?? process.env.NAS_HOSTNAME,
		output,
	};
}

export function requireVariable(name) {
	const value = process.env[name];
	if (!value) throw new Error(`${name} manque dans le .env (voir .env.example)`);
	return value;
}

export function requireNasHost(config) {
	if (!config.nasHost) throw new Error("Adresse du NAS inconnue : donnez --nas ou NAS_HOSTNAME dans le .env");
	return config.nasHost;
}
