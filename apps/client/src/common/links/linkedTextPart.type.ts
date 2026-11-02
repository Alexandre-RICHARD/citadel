import type { ExternalLinkKey } from "./externalLinkKey.type";

// Un morceau d'un texte à liens : du texte brut, ou un lien du dictionnaire avec le texte qui le porte
export type LinkedTextPart =
	| { kind: "text"; text: string }
	| { kind: "link"; text: string; key: ExternalLinkKey };
