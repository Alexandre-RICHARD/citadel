import type { IgdbGameNode } from "./igdbGameNode.type.ts";

// Fiche rattachée comme version, mais d'un type qui n'en fait pas une (bundle sans version_parent, remake…) : ignorée
export type IgdbSkippedEntry = {
	typeName: string;
	entry: IgdbGameNode;
};
