import type { Mail } from "../mail.type.ts";
import { escapeHtml } from "./escapeHtml.ts";

type MailContent = {
	// Paragraphes de vrai texte : un mail trop court, face au pixel de suivi de Brevo, passe pour du spam
	paragraphs: string[];
	// Petite ligne grise en bas ; null : aucune
	note: string | null;
};

function toHtmlParagraph(paragraph: string, style: string): string {
	return `<p style="${style}">${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`;
}

/**
 * Le même contenu en texte brut et en HTML, tout le texte échappé. Un HTML sobre, aux styles en ligne : ce que les
 * clients mail affichent le mieux, et ce que les filtres anti-spam préfèrent
 */
export function buildMailBodies({
	paragraphs,
	note,
}: MailContent): Pick<Mail, "text" | "html"> {
	const allParagraphs = note === null ? paragraphs : [...paragraphs, note];
	const htmlParagraphs = paragraphs.map((paragraph) =>
		toHtmlParagraph(paragraph, "margin: 0 0 16px;"),
	);
	if (note !== null)
		htmlParagraphs.push(
			toHtmlParagraph(note, "margin: 24px 0 0; color: #666; font-size: 13px;"),
		);

	return {
		text: allParagraphs.join("\n\n"),
		html: `<!doctype html><html lang="fr"><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">${htmlParagraphs.join("")}</body></html>`,
	};
}
