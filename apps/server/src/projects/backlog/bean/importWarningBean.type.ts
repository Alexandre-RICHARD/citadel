// Fiche IGDB rattachée comme version, mais ignorée à cause de son type
export type ImportWarningBean = {
	igdbId: number;
	name: string;
	typeName: string;
	entryJson: string;
};
