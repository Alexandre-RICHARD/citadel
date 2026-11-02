import { escapeHtml } from "../escapeHtml.ts";

// Un texte affiché tel quel, ses retours à la ligne compris
export function toHtmlText(text: string): string {
	return escapeHtml(text).replaceAll("\n", "<br>");
}
