import { hexToRgba } from "@citadel/common/src/universal/color/hexToRgba.ts";

import { MAIL_SITE } from "../../mailSite.ts";
import { escapeHtml } from "../escapeHtml.ts";
import type { MailAccentEnum } from "../mailAccent.enum.ts";
import type { MailLayout } from "../mailLayout.type.ts";
import { MAIL_ACCENTS } from "../palette/mailAccents.ts";
import { MAIL_COLORS } from "../palette/mailColors.ts";
import { brandBadgeHtml } from "./brandBadgeHtml.ts";
import { fontStyle } from "./fontStyle.ts";
import { linearGradient } from "./linearGradient.ts";
import { MAIL_STYLE_SHEET } from "./mailStyleSheet.ts";
import { presentationTable } from "./presentationTable.ts";
import { renderBlockHtml } from "./renderBlockHtml.ts";
import { toHtmlText } from "./toHtmlText.ts";

const { light, hero } = MAIL_COLORS;
const CARD_RADIUS = "20px";
const CARD_WIDTH = 600;
// Remplit l'aperçu de la boîte de réception après le texte voulu, pour qu'il n'y affiche pas la suite du mail
const PREVIEW_FILLER = "&nbsp;&zwnj;".repeat(90);

function headHtml(title: string): string {
	return [
		'<meta charset="utf-8">',
		'<meta name="viewport" content="width=device-width, initial-scale=1">',
		'<meta name="x-apple-disable-message-reformatting">',
		'<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">',
		'<meta name="color-scheme" content="light dark">',
		'<meta name="supported-color-schemes" content="light dark">',
		`<title>${escapeHtml(title)}</title>`,
		`<style>${MAIL_STYLE_SHEET}</style>`,
	].join("");
}

function previewHtml(preview: string): string {
	return `<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:${light.page};">${escapeHtml(preview)}${PREVIEW_FILLER}</div>`;
}

function haloGradient(
	color: string,
	alpha: number,
	at: string,
	reach: string,
): string {
	return `radial-gradient(circle at ${at},${hexToRgba(color, alpha)} 0%,${hexToRgba(color, 0)} ${reach})`;
}

// Les halos de la homepage : violet en haut à gauche, la couleur du mail en haut à droite, cyan en bas
function heroBackground(accent: MailAccentEnum): string {
	return [
		haloGradient(hero.glowTopLeft, 0.6, "0% 0%", "55%"),
		haloGradient(MAIL_ACCENTS[accent].glow, 0.5, "100% 0%", "60%"),
		haloGradient(hero.glowBottomRight, 0.32, "85% 130%", "60%"),
	].join(",");
}

function kickerHtml(kicker: string, accent: MailAccentEnum): string {
	return presentationTable(
		`<tr><td style="padding:7px 14px 7px 12px;border:1px solid ${hero.border};border-radius:999px;background-color:${hero.pill};${fontStyle({ size: 11, weight: 700, lineHeight: 1.2, color: hero.text })}letter-spacing:0.16em;text-transform:uppercase;"><span style="color:${MAIL_ACCENTS[accent].dark.hue};">&#9679;</span>&nbsp;&nbsp;${escapeHtml(kicker)}</td></tr>`,
	);
}

function brandHtml(): string {
	return presentationTable(
		`<tr><td valign="middle">${brandBadgeHtml(32)}</td><td valign="middle" style="padding-left:12px;${fontStyle({ size: 12, weight: 700, lineHeight: 1.2, color: hero.text })}letter-spacing:0.18em;text-transform:uppercase;">${escapeHtml(MAIL_SITE.name)}</td></tr>`,
	);
}

function heroHtml({
	accent,
	kicker,
	title,
	lead,
}: Pick<MailLayout, "accent" | "kicker" | "title" | "lead">): string {
	const leadHtml =
		lead === null
			? ""
			: `<p style="margin:14px 0 0;${fontStyle({ size: 16, lineHeight: 1.55, color: hero.muted })}">${toHtmlText(lead)}</p>`;
	return [
		`<tr><td class="cdl-pad" bgcolor="${hero.background}" style="padding:28px 40px 38px;background-color:${hero.background};background-image:${heroBackground(accent)};border-radius:${CARD_RADIUS} ${CARD_RADIUS} 0 0;">`,
		brandHtml(),
		`<div style="height:40px;line-height:40px;font-size:0;">&nbsp;</div>`,
		kickerHtml(kicker, accent),
		`<h1 class="cdl-title" style="margin:18px 0 0;${fontStyle({ family: "display", size: 32, weight: 800, lineHeight: 1.15, color: hero.text })}letter-spacing:-0.01em;overflow-wrap:anywhere;word-break:break-word;">${escapeHtml(title)}</h1>`,
		leadHtml,
		"</td></tr>",
		// Le filet aux quatre couleurs de décoration, entre l'en-tête et le corps
		`<tr><td height="4" bgcolor="${MAIL_ACCENTS[accent].hue}" style="height:4px;background-color:${MAIL_ACCENTS[accent].hue};background-image:${linearGradient(90, MAIL_COLORS.spectrum)};font-size:0;line-height:0;">&nbsp;</td></tr>`,
	].join("");
}

function bodyHtml({
	accent,
	blocks,
}: Pick<MailLayout, "accent" | "blocks">): string {
	const rows = blocks.map(
		(block, index) =>
			`<tr><td style="padding-top:${index === 0 ? 0 : 24}px;">${renderBlockHtml(block, accent)}</td></tr>`,
	);
	return `<tr><td class="cdl-card cdl-pad" bgcolor="${light.surface}" style="padding:36px 40px 40px;background-color:${light.surface};border-radius:0 0 ${CARD_RADIUS} ${CARD_RADIUS};">${presentationTable(rows.join(""), { width: "100%" })}</td></tr>`;
}

function footerHtml(note: string | null, accent: MailAccentEnum): string {
	const noteHtml =
		note === null
			? ""
			: `<p class="cdl-subtle" style="margin:0 0 20px;${fontStyle({ size: 12.5, lineHeight: 1.6, color: light.subtle })}">${toHtmlText(note)}</p>`;
	const dots = MAIL_COLORS.spectrum
		.map(
			(color) =>
				`<span style="display:inline-block;width:6px;height:6px;margin:0 3px;border-radius:999px;background-color:${color};"></span>`,
		)
		.join("");
	return [
		`<tr><td class="cdl-pad" align="center" style="padding:28px 40px 0;">`,
		noteHtml,
		`<p style="margin:0;font-size:0;line-height:6px;">${dots}</p>`,
		`<p class="cdl-muted" style="margin:10px 0 0;${fontStyle({ size: 12, weight: 600, lineHeight: 1.6, color: light.muted })}">${escapeHtml(MAIL_SITE.name)}&nbsp;&middot;&nbsp;<a class="cdl-tint-${accent}" href="${MAIL_SITE.url}" style="color:${MAIL_ACCENTS[accent].hue};text-decoration:none;">${MAIL_SITE.host}</a></p>`,
		"</td></tr>",
	].join("");
}

// Le mail entier : fond crème, carte à en-tête sombre, pied sous la carte. Les styles en ligne portent tout le
// rendu ; la feuille de style n'ajoute que le mode sombre et le téléphone. Outlook (Windows) ignore `max-width` : le
// tableau à largeur fixe des commentaires conditionnels la lui donne
export function renderMailHtml(layout: MailLayout): string {
	const card = presentationTable(`${heroHtml(layout)}${bodyHtml(layout)}`, {
		width: "100%",
		className: "cdl-card",
		style: `border:1px solid ${light.border};border-radius:${CARD_RADIUS};background-color:${light.surface};box-shadow:0 30px 60px -30px rgba(24,20,43,0.35);`,
	});
	const column = presentationTable(
		`<tr><td>${card}</td></tr>${footerHtml(layout.note, layout.accent)}`,
		{ width: "100%", style: `max-width:${CARD_WIDTH}px;` },
	);
	const page = presentationTable(
		`<tr><td class="cdl-gutter" align="center" style="padding:32px 16px 48px;"><!--[if mso]><table role="presentation" width="${CARD_WIDTH}" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->${column}<!--[if mso]></td></tr></table><![endif]--></td></tr>`,
		{
			width: "100%",
			className: "cdl-page",
			style: `background-color:${light.page};`,
		},
	);
	return `<!doctype html><html lang="fr" dir="ltr"><head>${headHtml(layout.title)}</head><body class="cdl-page" style="margin:0;padding:0;background-color:${light.page};">${previewHtml(layout.preview)}${page}</body></html>`;
}
