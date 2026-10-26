// Chiffres que demande un rang de sous-jeu en millièmes : 1 pour 3.1, 2 pour 3.01 ou 3.15, 3 pour 3.001
export function countSubPartDigits(subPart: number): number {
	if (subPart % 100 === 0) return 1;
	return subPart % 10 === 0 ? 2 : 3;
}
