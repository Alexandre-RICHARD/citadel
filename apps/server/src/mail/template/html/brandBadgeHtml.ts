import { MailAccentEnum } from "../mailAccent.enum.ts";
import { MAIL_ACCENTS } from "../palette/mailAccents.ts";
import { MAIL_COLORS } from "../palette/mailColors.ts";
import { fontStyle } from "./fontStyle.ts";
import { linearGradient } from "./linearGradient.ts";
import { presentationTable } from "./presentationTable.ts";

// Le A du logo dans un carré aux couleurs de décoration : en texte, il s'affiche même quand les images sont bloquées.
// Sans dégradé (Outlook), le carré reste magenta
export function brandBadgeHtml(size: number): string {
	const style = [
		`width:${size}px;height:${size}px;border-radius:${Math.round(size * 0.3)}px;`,
		`background-color:${MAIL_ACCENTS[MailAccentEnum.MAGENTA].hue};`,
		`background-image:${linearGradient(135, MAIL_COLORS.badge)};`,
		fontStyle({
			family: "display",
			size: Math.round(size * 0.5),
			weight: 800,
			lineHeight: 1,
			color: "#ffffff",
		}),
	].join("");
	return presentationTable(
		`<tr><td width="${size}" height="${size}" align="center" valign="middle" style="${style}">A</td></tr>`,
	);
}
