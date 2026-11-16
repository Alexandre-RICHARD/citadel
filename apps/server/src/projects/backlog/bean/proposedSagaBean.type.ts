// La saga que propose la collection TMDB d'un film : celle du compte qui lui est reliée, sinon une nouvelle (sagaId null)
export type ProposedSagaBean = {
	sagaId: number | null;
	name: string;
};
