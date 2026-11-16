// Saga choisie pour un média du backlog
export enum SagaChoiceKindEnum {
	// Celle que propose la collection TMDB du film : la saga qui lui est reliée, sinon une nouvelle à son nom
	PROPOSED = "proposed",
	// Une saga existante du compte
	OTHER = "other",
	// Une nouvelle saga, par son nom ; un nom déjà pris désigne la saga existante
	NEW = "new",
	NONE = "none",
}
