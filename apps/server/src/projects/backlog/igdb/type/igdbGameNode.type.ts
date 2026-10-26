// Nœud de l'arbre des versions : de quoi remonter à l'original et descendre vers ses versions
export type IgdbGameNode = {
	id: number;
	name: string;
	game_type?: number;
	version_parent?: number;
	parent_game?: number;
	remasters?: number[];
	ports?: number[];
	expanded_games?: number[];
};
