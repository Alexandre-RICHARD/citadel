/**
 * Le texte d'un fichier CSV : en UTF-8, ou à défaut en Windows-1252, l'encodage qu'Excel en français écrit par défaut
 * (« série » y est un octet E9, que le UTF-8 lirait comme un caractère de remplacement)
 */
export function decodeCsvText(bytes: ArrayBuffer): string {
	try {
		return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
	} catch {
		return new TextDecoder("windows-1252").decode(bytes);
	}
}
