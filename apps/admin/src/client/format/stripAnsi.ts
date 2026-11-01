// Les couleurs du terminal (citadel écrit ses titres en gras, ses erreurs en rouge) :
// des codes « ESC [ … m » illisibles dans la console, retirés
// eslint-disable-next-line no-control-regex -- le caractère ESC est justement visé
const ANSI_SEQUENCE = /\u001b\[[0-9;]*m/g;

export function stripAnsi(text: string): string {
	return text.replace(ANSI_SEQUENCE, "");
}
