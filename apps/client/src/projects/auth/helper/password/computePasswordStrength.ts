import { PasswordStrengthEnum } from "./passwordStrength.enum";

// Les rangées de clavier, dans les deux sens de lecture : « azerty », « poiuy », « 1234 »…
const KEYBOARD_ROWS = [
	"azertyuiop",
	"qwertyuiop",
	"qwertzuiop",
	"qsdfghjklm",
	"asdfghjkl",
	"wxcvbn",
	"zxcvbnm",
	"1234567890",
];
// Une suite de clavier ne compte qu'à partir de 4 touches (« aze » est un début de mot comme un autre)
const KEYBOARD_RUN_MIN = 4;
// Répétitions (« aaa ») et suites (« abc », « 321 ») comptent dès 3 caractères
const PATTERN_RUN_MIN = 3;

// Bits de hasard au-delà desquels on passe au niveau suivant
const STRENGTH_THRESHOLDS: [number, PasswordStrengthEnum][] = [
	[80, PasswordStrengthEnum.EXCELLENT],
	[60, PasswordStrengthEnum.GOOD],
	[40, PasswordStrengthEnum.FAIR],
	[28, PasswordStrengthEnum.WEAK],
];

// Minuscules, majuscules, chiffres, ponctuation et symboles, chacune avec le nombre de caractères qu'elle offre
const CHARACTER_FAMILIES = [
	{ test: /\p{Ll}/u, size: 26 },
	{ test: /\p{Lu}/u, size: 26 },
	{ test: /\p{Nd}/u, size: 10 },
	{ test: /[\p{P}\p{S}\p{Zs}]/u, size: 33 },
];
// Lettres d'autres alphabets, émojis : une large famille de plus
const OTHER_CHARACTERS_SIZE = 100;

function isOtherCharacter(character: string): boolean {
	return CHARACTER_FAMILIES.every(({ test }) => !test.test(character));
}

// Le nombre de caractères parmi lesquels le mot de passe semble tiré : la somme des familles qu'il utilise
function countAlphabetSize(characters: string[]): number {
	const size = CHARACTER_FAMILIES.filter(({ test }) =>
		characters.some((character) => test.test(character)),
	).reduce((total, { size: familySize }) => total + familySize, 0);
	return characters.some(isOtherCharacter)
		? size + OTHER_CHARACTERS_SIZE
		: size;
}

function isNextInKeyboardRow(previous: string, current: string): boolean {
	const pair = `${previous}${current}`.toLowerCase();
	const reversedPair = `${current}${previous}`.toLowerCase();
	return KEYBOARD_ROWS.some(
		(row) => row.includes(pair) || row.includes(reversedPair),
	);
}

function isNextInSequence(previous: string, current: string): number | null {
	const step = (current.codePointAt(0) ?? 0) - (previous.codePointAt(0) ?? 0);
	return Math.abs(step) === 1 ? step : null;
}

// Longueur d'un motif qui commence ici : répétition, suite (« abcd », « 4321 ») ou rangée de clavier
function measurePatternAt(characters: string[], start: number): number {
	const first = characters[start] ?? "";
	let repeated = 1;
	while (characters[start + repeated] === first) repeated += 1;

	let sequence = 1;
	const step = isNextInSequence(first, characters[start + 1] ?? "");
	if (step !== null)
		while (
			isNextInSequence(
				characters[start + sequence - 1] ?? "",
				characters[start + sequence] ?? "",
			) === step
		)
			sequence += 1;

	let keyboard = 1;
	while (
		start + keyboard < characters.length &&
		isNextInKeyboardRow(
			characters[start + keyboard - 1] ?? "",
			characters[start + keyboard] ?? "",
		)
	)
		keyboard += 1;

	return Math.max(
		repeated >= PATTERN_RUN_MIN ? repeated : 1,
		sequence >= PATTERN_RUN_MIN ? sequence : 1,
		keyboard >= KEYBOARD_RUN_MIN ? keyboard : 1,
	);
}

// Un motif ne compte que pour un caractère : « aaaa » ne vaut guère plus que « a »
function countEffectiveLength(characters: string[]): number {
	let effectiveLength = 0;
	let index = 0;
	while (index < characters.length) {
		index += measurePatternAt(characters, index);
		effectiveLength += 1;
	}
	return effectiveLength;
}

/**
 * La force d'un mot de passe, sans bibliothèque : sa longueur (motifs comptés pour un caractère) multipliée par la
 * variété de ses caractères. Indicative : elle ne connaît aucun dictionnaire, et surestime donc un mot courant maquillé
 * (« P@ssw0rd! »)
 */
export function computePasswordStrength(
	password: string,
): PasswordStrengthEnum {
	const characters = Array.from(password.normalize("NFC"));
	if (characters.length === 0) return PasswordStrengthEnum.VERY_WEAK;

	const bits =
		countEffectiveLength(characters) * Math.log2(countAlphabetSize(characters));
	const reached = STRENGTH_THRESHOLDS.find(([threshold]) => bits >= threshold);
	return reached?.[1] ?? PasswordStrengthEnum.VERY_WEAK;
}
