// `undefined` : champ non modifié (mise à jour partielle)
// TODO Mieux gérer le undefined ou le null
export type UpdateDeathBean = {
	id: number;
	date: Date | undefined;
	comment: string | null | undefined;
};
