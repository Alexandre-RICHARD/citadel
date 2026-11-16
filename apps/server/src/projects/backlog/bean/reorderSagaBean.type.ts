// « Réorganiser la saga » : le nouveau numéro de chacun de ses médias du backlog
export type ReorderSagaBean = {
	sagaId: number;
	entries: { userMediaId: number; sagaNumber: number }[];
};
