/**
 * Distance de Levenshtein : nombre minimum d'opérations sur un caractère (insertion, suppression ou substitution)
 * pour passer d'une chaîne à l'autre. Une inversion de deux lettres voisines compte donc pour 2.
 *
 * Attention : les chaînes sont comparées par unités UTF-16, pas par caractères affichés.
 * Un emoji ou un caractère rare (hors du plan multilingue de base) occupe 2 unités et peut compter pour 2 opérations,
 * et "é" précomposé n'est pas égal à "e" suivi d'un accent combinant : normaliser avec normalize("NFC") si besoin.
 *
 * Algorithme : vecteurs de bits de Myers (1999), formulation de Hyyrö (2003).
 * La matrice classique de Wagner-Fischer (case [i][j] = distance entre les i premiers caractères de la courte chaîne
 * et les j premiers de la longue) est calculée colonne par colonne, mais 32 lignes à la fois grâce aux opérations
 * sur les bits d'un entier : O(⌈m / 32⌉ × n) au lieu de O(m × n), avec m ≤ n les longueurs des deux chaînes.
 * Deux cases voisines de la matrice ne diffèrent que de -1, 0 ou +1 : chaque colonne est stockée sous forme
 * de deux masques, les lignes où la distance augmente de 1 par rapport à la ligne du dessus, et celles où elle baisse de 1.
 */

const BLOCK_SIZE = 32;

// Pour chaque unité UTF-16, masque des lignes du bloc en cours où elle apparaît dans la chaîne courte.
// Tableau partagé (256 Ko) remis à zéro après chaque bloc : plus rapide qu'une Map recréée à chaque appel
const matchMasks = new Int32Array(0x10000);

/**
 * Calcule un bloc de 32 lignes de la matrice, sur toutes les colonnes.
 * Une différence horizontale est l'écart (-1, 0 ou +1) entre une case et sa voisine de gauche.
 * Reçoit celles de la ligne juste au-dessus du bloc et renvoie celles de la dernière ligne du bloc
 */
function computeBlock(
	pattern: string,
	blockStart: number,
	text: string,
	deltasAbove: readonly number[],
): number[] {
	const deltasBelow = new Array<number>(text.length);
	const blockEnd = Math.min(blockStart + BLOCK_SIZE, pattern.length);
	const lastRowBit = 1 << (blockEnd - blockStart - 1);

	for (let row = blockStart; row < blockEnd; row += 1) {
		matchMasks[pattern.charCodeAt(row)] |= 1 << (row - blockStart);
	}

	// Colonne 0 : la distance augmente de 1 à chaque ligne (supprimer un caractère de plus)
	let verticalPlus = -1;
	let verticalMinus = 0;

	for (let column = 0; column < text.length; column += 1) {
		let matches = matchMasks[text.charCodeAt(column)];
		const deltaAbove = deltasAbove[column];

		const verticalChanges = matches | verticalMinus;
		if (deltaAbove < 0) matches |= 1;
		// L'addition propage une retenue le long des suites de +1 verticaux qui suivent une correspondance :
		// c'est elle qui calcule le minimum de chaque case pour les 32 lignes en une seule opération
		const horizontalChanges =
			(((matches & verticalPlus) + verticalPlus) ^ verticalPlus) | matches;

		let horizontalPlus = verticalMinus | ~(horizontalChanges | verticalPlus);
		let horizontalMinus = verticalPlus & horizontalChanges;

		if (horizontalPlus & lastRowBit) deltasBelow[column] = 1;
		else if (horizontalMinus & lastRowBit) deltasBelow[column] = -1;
		else deltasBelow[column] = 0;

		// Décalage d'une ligne vers le bas : la première ligne du bloc reçoit la différence venue du bloc au-dessus
		horizontalPlus <<= 1;
		horizontalMinus <<= 1;
		if (deltaAbove < 0) horizontalMinus |= 1;
		else if (deltaAbove > 0) horizontalPlus |= 1;

		verticalPlus = horizontalMinus | ~(verticalChanges | horizontalPlus);
		verticalMinus = horizontalPlus & verticalChanges;
	}

	for (let row = blockStart; row < blockEnd; row += 1) {
		matchMasks[pattern.charCodeAt(row)] = 0;
	}

	return deltasBelow;
}

export function calculateLevenshteinDistance(a: string, b: string): number {
	if (a === b) return 0;

	const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];

	// Un début ou une fin communs ne coûtent jamais rien : on les retire avant le calcul
	let start = 0;
	while (
		start < shorter.length &&
		shorter.charCodeAt(start) === longer.charCodeAt(start)
	) {
		start += 1;
	}
	let shorterEnd = shorter.length;
	let longerEnd = longer.length;
	while (
		shorterEnd > start &&
		shorter.charCodeAt(shorterEnd - 1) === longer.charCodeAt(longerEnd - 1)
	) {
		shorterEnd -= 1;
		longerEnd -= 1;
	}

	const pattern = shorter.slice(start, shorterEnd);
	const text = longer.slice(start, longerEnd);
	if (pattern.length === 0) return text.length;

	// Ligne 0 : la distance augmente de 1 à chaque colonne (insérer un caractère de plus)
	let horizontalDeltas = new Array<number>(text.length).fill(1);
	for (
		let blockStart = 0;
		blockStart < pattern.length;
		blockStart += BLOCK_SIZE
	) {
		horizontalDeltas = computeBlock(
			pattern,
			blockStart,
			text,
			horizontalDeltas,
		);
	}

	// Dernière ligne : on part de la case [m][0] = m et on ajoute les différences colonne par colonne
	let distance = pattern.length;
	for (const delta of horizontalDeltas) distance += delta;
	return distance;
}
