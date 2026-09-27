// `undefined` : champ non modifié (mise à jour partielle)
export type UpdateDeathBean = {
	id: number;
	date: Date | undefined;
	comment: string | null | undefined;
};
