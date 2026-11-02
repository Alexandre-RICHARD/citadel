import type { MailAccentEnum } from "./mailAccent.enum.ts";
import type { MailStatus } from "./mailStatus.type.ts";

type MailField = {
	label: string;
	value: string;
	href?: string;
	// La valeur remplace une donnée absente (« non donné ») : en gris et en italique
	isMissing?: boolean;
};

// Une brique du corps d'un mail ; chacune s'écrit en HTML et en texte brut
export type MailBlock =
	| { kind: "paragraph"; text: string }
	| { kind: "quote"; label: string; text: string; isProminent: boolean }
	| { kind: "fields"; fields: MailField[] }
	| { kind: "callout"; accent: MailAccentEnum; title: string; text: string }
	| { kind: "button"; label: string; href: string }
	| {
			kind: "meter";
			value: number;
			max: number;
			caption: string;
			// Des coupures dans la jauge, aux seuils qui comptent
			marks: number[];
	  }
	| { kind: "statuses"; statuses: MailStatus[] }
	| { kind: "signature"; name: string; href: string };
