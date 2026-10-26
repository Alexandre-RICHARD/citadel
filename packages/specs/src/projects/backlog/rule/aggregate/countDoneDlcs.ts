// DLC faits parmi ceux du jeu : un DLC qui n'est plus rattaché au jeu ne compte pas
export function countDoneDlcs(doneDlcIds: number[], dlcIds: number[]): number {
	const gameDlcIds = new Set(dlcIds);
	return new Set(doneDlcIds.filter((dlcId) => gameDlcIds.has(dlcId))).size;
}
