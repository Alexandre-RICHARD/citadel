// Les épisodes à cocher ou décocher ; « cascade » : plus d'un, à confirmer par un dialogue
export type VerifiedPlan = {
	kind: "direct" | "cascade";
	episodeIds: number[];
	isVerified: boolean;
};
