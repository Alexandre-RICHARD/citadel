import { mixHexColors } from "@citadel/common/src/universal/color/mixHexColors.ts";

import { escapeHtml } from "../escapeHtml.ts";
import { MailAccentEnum } from "../mailAccent.enum.ts";
import type { MailBlock } from "../mailBlock.type.ts";
import { meterPercent } from "../meterPercent.ts";
import type { MeterSegment } from "../meterSegment.type.ts";
import { MAIL_ACCENTS } from "../palette/mailAccents.ts";
import { MAIL_COLORS } from "../palette/mailColors.ts";
import { splitMeterSegments } from "../splitMeterSegments.ts";
import { brandBadgeHtml } from "./brandBadgeHtml.ts";
import { fontStyle } from "./fontStyle.ts";
import { LABEL_STYLE } from "./labelStyle.ts";
import { linearGradient } from "./linearGradient.ts";
import { presentationTable } from "./presentationTable.ts";
import { toHtmlText } from "./toHtmlText.ts";

type BlockOf<Kind extends MailBlock["kind"]> = Extract<
	MailBlock,
	{ kind: Kind }
>;

const { light, constructive } = MAIL_COLORS;
const BREAK_ANYWHERE = "overflow-wrap:anywhere;word-break:break-word;";
// Une cellule vide qui ne garde que sa couleur : sans texte, aucun client ne lui donne de hauteur de ligne
const EMPTY_CELL = "font-size:0;line-height:0;";

function linkHtml(text: string, href: string, accent: MailAccentEnum): string {
	return `<a class="cdl-tint-${accent}" href="${escapeHtml(href)}" style="color:${MAIL_ACCENTS[accent].hue};text-decoration:none;font-weight:600;">${toHtmlText(text)}</a>`;
}

function paragraphHtml({ text }: BlockOf<"paragraph">): string {
	return `<p class="cdl-text" style="margin:0;${fontStyle({ size: 16, lineHeight: 1.65, color: light.text })}">${toHtmlText(text)}</p>`;
}

function quoteHtml(
	{ label, text, isProminent }: BlockOf<"quote">,
	accent: MailAccentEnum,
): string {
	const textStyle = isProminent
		? fontStyle({
				family: "display",
				size: 19,
				weight: 600,
				lineHeight: 1.4,
				color: light.text,
			})
		: fontStyle({ size: 15, lineHeight: 1.7, color: light.text });
	const bar = `<td class="cdl-fill-${accent}" width="4" style="width:4px;background-color:${MAIL_ACCENTS[accent].hue};border-radius:4px 0 0 4px;${EMPTY_CELL}">&nbsp;</td>`;
	const content = `<td class="cdl-panel" style="padding:18px 22px;background-color:${light.panel};border-radius:0 14px 14px 0;"><p class="cdl-subtle" style="margin:0 0 8px;${LABEL_STYLE}">${escapeHtml(label)}</p><p class="cdl-text" style="margin:0;${textStyle}${BREAK_ANYWHERE}">${toHtmlText(text)}</p></td>`;
	return presentationTable(`<tr>${bar}${content}</tr>`, { width: "100%" });
}

function fieldsHtml(
	{ fields }: BlockOf<"fields">,
	accent: MailAccentEnum,
): string {
	const rows = fields.map(({ label, value, href, isMissing }, index) => {
		const separator =
			index === 0 ? "" : `border-top:1px solid ${light.border};`;
		const valueHtml =
			href === undefined ? toHtmlText(value) : linkHtml(value, href, accent);
		const valueStyle = isMissing
			? `${fontStyle({ size: 15, lineHeight: 1.5, color: light.subtle })}font-style:italic;`
			: fontStyle({
					size: 15,
					weight: 500,
					lineHeight: 1.5,
					color: light.text,
				});
		return [
			"<tr>",
			`<td class="cdl-field-label cdl-line cdl-subtle" width="96" valign="top" style="width:96px;padding:16px 0 12px 18px;${separator}${LABEL_STYLE}">${escapeHtml(label)}</td>`,
			`<td class="cdl-field-value cdl-line ${isMissing ? "cdl-subtle" : "cdl-text"}" valign="top" style="padding:12px 18px;${separator}${valueStyle}${BREAK_ANYWHERE}">${valueHtml}</td>`,
			"</tr>",
		].join("");
	});
	return presentationTable(rows.join(""), {
		width: "100%",
		className: "cdl-line",
		style: `border:1px solid ${light.border};border-radius:14px;`,
	});
}

function calloutHtml({ accent, title, text }: BlockOf<"callout">): string {
	const colors = MAIL_ACCENTS[accent];
	return presentationTable(
		`<tr><td class="cdl-callout-${accent}" style="padding:16px 20px;background-color:${colors.subtle};border:1px solid ${colors.border};border-radius:14px;"><p class="cdl-tint-${accent}" style="margin:0 0 4px;${fontStyle({ size: 15, weight: 700, lineHeight: 1.4, color: colors.strong })}">${escapeHtml(title)}</p><p class="cdl-text" style="margin:0;${fontStyle({ size: 15, lineHeight: 1.6, color: light.text })}">${toHtmlText(text)}</p></td></tr>`,
		{ width: "100%" },
	);
}

// Un bouton tout en HTML, sans image : il reste un bouton quand les images sont bloquées
function buttonHtml(
	{ label, href }: BlockOf<"button">,
	accent: MailAccentEnum,
): string {
	const { hue } = MAIL_ACCENTS[accent];
	return presentationTable(
		`<tr><td class="cdl-fill-${accent}" bgcolor="${hue}" style="background-color:${hue};border-radius:12px;box-shadow:0 12px 24px -14px ${hue};"><a class="cdl-on-fill-${accent}" href="${escapeHtml(href)}" style="display:inline-block;padding:14px 26px;${fontStyle({ size: 15, weight: 700, lineHeight: 1.2, color: "#ffffff" })}text-decoration:none;border-radius:12px;">${escapeHtml(label)}&nbsp;&nbsp;&rarr;</a></td></tr>`,
	);
}

// Le vide entre deux morceaux de jauge, de la couleur de la carte
const METER_GAP = `<td class="cdl-card" width="4" style="width:4px;background-color:${light.surface};${EMPTY_CELL}">&nbsp;</td>`;

// Arrondi aux deux bouts de la jauge et de part et d'autre d'un repère ; droit là où le remplissage s'arrête
function segmentRadius(
	segment: MeterSegment,
	startsAfterMark: boolean,
): string {
	const left = segment.from === 0 || startsAfterMark ? "999px" : "0";
	const right = segment.to === 1 || segment.endsAtMark ? "999px" : "0";
	return `${left} ${right} ${right} ${left}`;
}

// Le dégradé du remplissage court d'un morceau à l'autre : chaque morceau en prend sa part
function segmentFill(
	segment: MeterSegment,
	filledUpTo: number,
	accent: MailAccentEnum,
): string {
	const { hue, glow } = MAIL_ACCENTS[accent];
	const [start, end] = [segment.from, segment.to].map((ratio) =>
		mixHexColors(glow, hue, ratio / filledUpTo),
	);
	return `background-color:${hue};background-image:${linearGradient(90, [start, end])};`;
}

function meterBarHtml(
	segments: MeterSegment[],
	accent: MailAccentEnum,
): string {
	const filledUpTo = Math.max(
		...segments.filter(({ isFilled }) => isFilled).map(({ to }) => to),
	);
	const cells = segments.map((segment, index) => {
		const width = `${((segment.to - segment.from) * 100).toFixed(2)}%`;
		const radius = segmentRadius(
			segment,
			index > 0 && segments[index - 1].endsAtMark,
		);
		const [className, background] = segment.isFilled
			? [`cdl-fill-${accent}`, segmentFill(segment, filledUpTo, accent)]
			: ["cdl-track", `background-color:${light.track};`];
		const cell = `<td class="${className}" width="${width}" style="width:${width};height:12px;${background}border-radius:${radius};${EMPTY_CELL}">&nbsp;</td>`;
		return segment.endsAtMark ? `${cell}${METER_GAP}` : cell;
	});
	return presentationTable(`<tr>${cells.join("")}</tr>`, { width: "100%" });
}

function meterHtml(
	{ value, max, caption, marks }: BlockOf<"meter">,
	accent: MailAccentEnum,
): string {
	const percent = meterPercent(value, max);
	const segments = splitMeterSegments(value, max, marks);
	const figure = `<span class="cdl-text cdl-meter-value" style="${fontStyle({ family: "display", size: 44, weight: 800, lineHeight: 1, color: light.text })}letter-spacing:-0.02em;">${value}</span><span class="cdl-muted" style="${fontStyle({ size: 15, weight: 500, lineHeight: 1.4, color: light.muted })}">&nbsp;/&nbsp;${max} ${escapeHtml(caption)}</span>`;
	const share = `<span class="cdl-tint-${accent}" style="${fontStyle({ size: 15, weight: 700, lineHeight: 1.4, color: MAIL_ACCENTS[accent].strong })}">${percent}&nbsp;%</span>`;
	return presentationTable(
		[
			`<tr><td valign="bottom" style="padding-bottom:14px;">${figure}</td><td align="right" valign="bottom" style="padding-bottom:16px;white-space:nowrap;">${share}</td></tr>`,
			`<tr><td colspan="2">${meterBarHtml(segments, accent)}</td></tr>`,
		].join(""),
		{ width: "100%" },
	);
}

function statusBadgeHtml(state: string, isAlert: boolean): string {
	const alert = MAIL_ACCENTS[MailAccentEnum.RED];
	const [color, background, className] = isAlert
		? [
				alert.strong,
				alert.subtle,
				`cdl-callout-${MailAccentEnum.RED} cdl-tint-${MailAccentEnum.RED}`,
			]
		: [constructive.strong, constructive.subtle, "cdl-ok"];
	return `<span class="${className}" style="display:inline-block;padding:5px 12px;border-radius:999px;background-color:${background};${fontStyle({ size: 12, weight: 700, lineHeight: 1.2, color })}letter-spacing:0.02em;white-space:nowrap;">&#9679;&nbsp;${escapeHtml(state)}</span>`;
}

function statusesHtml({ statuses }: BlockOf<"statuses">): string {
	const rows = statuses.map(({ label, detail, state, isAlert }, index) => {
		const separator =
			index === 0 ? "" : `border-top:1px solid ${light.border};`;
		return [
			"<tr>",
			`<td class="cdl-line" valign="middle" style="padding:14px 0 14px 18px;${separator}"><p class="cdl-text" style="margin:0;${fontStyle({ size: 15, weight: 600, lineHeight: 1.4, color: light.text })}">${escapeHtml(label)}</p><p class="cdl-muted" style="margin:2px 0 0;${fontStyle({ size: 13, lineHeight: 1.4, color: light.muted })}">${escapeHtml(detail)}</p></td>`,
			`<td class="cdl-line" align="right" valign="middle" style="padding:14px 18px 14px 12px;${separator}">${statusBadgeHtml(state, isAlert)}</td>`,
			"</tr>",
		].join("");
	});
	return presentationTable(rows.join(""), {
		width: "100%",
		className: "cdl-line",
		style: `border:1px solid ${light.border};border-radius:14px;`,
	});
}

// Sous un filet : la signature clôt le mail
function signatureHtml(
	{ name, href }: BlockOf<"signature">,
	accent: MailAccentEnum,
): string {
	const { host } = new URL(href);
	const signature = presentationTable(
		`<tr><td width="44" valign="middle">${brandBadgeHtml(44)}</td><td valign="middle" style="padding-left:14px;"><p class="cdl-text" style="margin:0;${fontStyle({ family: "display", size: 17, weight: 700, lineHeight: 1.3, color: light.text })}">${escapeHtml(name)}</p><p style="margin:2px 0 0;${fontStyle({ size: 14, lineHeight: 1.4, color: light.muted })}">${linkHtml(host, href, accent)}</p></td></tr>`,
	);
	return presentationTable(
		`<tr><td class="cdl-line" style="padding-top:24px;border-top:1px solid ${light.border};">${signature}</td></tr>`,
		{ width: "100%" },
	);
}

// `accent` : la couleur du mail, que prennent les liens, les boutons et les jauges
export function renderBlockHtml(
	block: MailBlock,
	accent: MailAccentEnum,
): string {
	switch (block.kind) {
		case "paragraph":
			return paragraphHtml(block);
		case "quote":
			return quoteHtml(block, accent);
		case "fields":
			return fieldsHtml(block, accent);
		case "callout":
			return calloutHtml(block);
		case "button":
			return buttonHtml(block, accent);
		case "meter":
			return meterHtml(block, accent);
		case "statuses":
			return statusesHtml(block);
		default:
			return signatureHtml(block, accent);
	}
}
