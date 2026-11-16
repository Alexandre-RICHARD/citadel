/**
 * La saga que propose la collection TMDB d'un film : celle du compte qui lui est reliée (`sagaId`), sinon une nouvelle
 * saga au nom de la collection (`sagaId` null)
 */
export type ProposedSagaDto = {
	sagaId: number | null;
	name: string;
};
