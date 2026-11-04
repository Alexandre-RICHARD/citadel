type RecoveryCodesFile = {
	codes: readonly string[];
	// L'adresse du compte, pour retrouver à quoi sert le fichier
	email: string;
	date: Date;
};

const FILE_DATE_LENGTH = 10;

// Le fichier texte à garder en lieu sûr : un code par ligne, et ce qu'il faut savoir pour s'en servir
export function buildRecoveryCodesFile({
	codes,
	email,
	date,
}: RecoveryCodesFile): string {
	return [
		"Codes de secours de la Citadel d'Alex",
		`Compte : ${email}`,
		`Créés le : ${date.toISOString().slice(0, FILE_DATE_LENGTH)}`,
		"",
		"Chaque code ne sert qu'une fois, à la place du code de ton application ou de ton email, quand tu ne peux plus y accéder.",
		"Garde ce fichier en lieu sûr : il donne accès à ton compte.",
		"",
		...codes,
		"",
	].join("\n");
}
