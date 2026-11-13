import { MAIL_SITE } from "../../mailSite.ts";
import type { MailLayout } from "../mailLayout.type.ts";
import { renderBlockText } from "./renderBlockText.ts";

// Le soulignement du titre s'arrête à cette longueur : un sujet de visiteur peut être long
const TITLE_RULE_MAX_LENGTH = 60;

// L'email en texte brut, dans l'ordre du HTML : en-tête, briques, note, puis le site
export function renderMailText({
	kicker,
	title,
	lead,
	blocks,
	note,
}: MailLayout): string {
	const titleRule = "=".repeat(Math.min(title.length, TITLE_RULE_MAX_LENGTH));
	return [
		`${kicker}\n${title}\n${titleRule}`,
		lead,
		...blocks.map(renderBlockText),
		note === null ? null : `---\n${note}`,
		`${MAIL_SITE.name} · ${MAIL_SITE.url}`,
	]
		.filter((section) => section !== null)
		.join("\n\n");
}
