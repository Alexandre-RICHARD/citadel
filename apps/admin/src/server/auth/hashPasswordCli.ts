import { hashPassword } from "./hashPassword.ts";

// Fabrique ADMIN_PASSWORD_HASH, à coller dans .env.prod :
//   sur le NAS : citadel admin-password
//   sur ton PC : pnpm admin:password
// Le mot de passe est tapé deux fois, sans s'afficher, et n'est écrit nulle part.

const MIN_LENGTH = 12;
const ENTER = new Set(["\r", "\n"]);
const CTRL_C = "\u0003";
const BACKSPACE = new Set(["\u007f", "\b"]);

// Pas un vrai terminal (texte envoyé par un « | », ou un terminal qui ne sait pas masquer
// la saisie) : la première ligne, dès qu'elle est complète
function readPipedLine(): Promise<string> {
	return new Promise((resolve) => {
		let text = "";
		function finish(): void {
			process.stdin.pause();
			process.stdout.write("\n");
			resolve(text.split("\n")[0]?.trimEnd() ?? "");
		}
		process.stdin.setEncoding("utf8");
		process.stdin.on("data", (chunk: string) => {
			text += chunk;
			if (text.includes("\n")) finish();
		});
		process.stdin.once("end", finish);
	});
}

// Terminal : chaque touche est lue sans être affichée
function readHiddenKeys(): Promise<string> {
	const input = process.stdin;
	return new Promise((resolve) => {
		let password = "";
		input.setRawMode(true);
		input.setEncoding("utf8");
		input.resume();

		function onData(chunk: string): void {
			for (const character of chunk) {
				if (ENTER.has(character)) {
					input.setRawMode(false);
					input.pause();
					input.off("data", onData);
					process.stdout.write("\n");
					resolve(password);
					return;
				}
				if (character === CTRL_C) {
					process.stdout.write("\n");
					process.exit(130);
				}
				password = BACKSPACE.has(character)
					? password.slice(0, -1)
					: password + character;
			}
		}

		input.on("data", onData);
	});
}

function readPassword(prompt: string): Promise<string> {
	process.stdout.write(prompt);
	return process.stdin.isTTY ? readHiddenKeys() : readPipedLine();
}

async function main(): Promise<void> {
	const password = await readPassword("Mot de passe de la console : ");
	if (password.length < MIN_LENGTH) {
		console.error(`Trop court : ${MIN_LENGTH} caractères au moins.`);
		process.exit(1);
	}
	if (process.stdin.isTTY) {
		const confirmation = await readPassword("Encore une fois : ");
		if (confirmation !== password) {
			console.error("Les deux saisies diffèrent : rien n'a été produit.");
			process.exit(1);
		}
	}
	process.stdout.write(
		`\nÀ mettre dans /Volume1/citadel/.env.prod (et dans Bitwarden) :\nADMIN_PASSWORD_HASH=${hashPassword(password)}\n`,
	);
}

main().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
