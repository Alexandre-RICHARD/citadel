// Endpoint `alternative_names` : le nom VF se cherche dans leur commentaire (« French title »)
export type IgdbAlternativeName = {
	id: number;
	name?: string;
	comment?: string;
};
