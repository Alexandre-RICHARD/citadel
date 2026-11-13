import { MailAccentEnum } from "../mailAccent.enum.ts";
import { MAIL_ACCENTS } from "../palette/mailAccents.ts";
import { MAIL_COLORS } from "../palette/mailColors.ts";
import { DARK_SCHEME_MEDIA } from "./darkSchemeMedia.ts";

const { dark, constructive } = MAIL_COLORS;

function darkAccentRules(accent: MailAccentEnum): string {
	const colors = MAIL_ACCENTS[accent].dark;
	return [
		`.cdl-fill-${accent}{background-color:${colors.hue}!important;background-image:none!important}`,
		`.cdl-on-fill-${accent}{color:${colors.content}!important}`,
		`.cdl-tint-${accent}{color:${colors.hue}!important}`,
		`.cdl-callout-${accent}{background-color:${colors.subtle}!important;border-color:${colors.border}!important}`,
	].join("");
}

const BASE_RULES = [
	":root{color-scheme:light dark;supported-color-schemes:light dark}",
	"body{margin:0;padding:0;width:100%!important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}",
	"table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}",
	"a{text-decoration:none}",
].join("");

// Sur un téléphone : marges resserrées, titre plus petit, étiquettes au-dessus de leur valeur
const PHONE_RULES = [
	"@media only screen and (max-width:620px){",
	".cdl-gutter{padding:12px 8px 28px!important}",
	".cdl-pad{padding-left:24px!important;padding-right:24px!important}",
	".cdl-title{font-size:26px!important}",
	".cdl-field-label,.cdl-field-value{display:block!important;width:auto!important}",
	".cdl-field-label{padding:14px 18px 0!important}",
	".cdl-field-value{padding:4px 18px 14px!important;border-top:0!important}",
	".cdl-meter-value{font-size:36px!important}",
	"}",
].join("");

// Le mode sombre des clients qui le laissent à l'email (Apple Email, iOS, Thunderbird…) : les couleurs sombres du thème.
// Gmail et Outlook inversent les couleurs eux-mêmes et ignorent ces règles
const DARK_RULES = [
	`${DARK_SCHEME_MEDIA}{`,
	`.cdl-page{background-color:${dark.page}!important}`,
	`.cdl-card{background-color:${dark.surface}!important;border-color:${dark.border}!important}`,
	`.cdl-panel{background-color:${dark.panel}!important}`,
	`.cdl-track{background-color:${dark.track}!important}`,
	`.cdl-line{border-color:${dark.border}!important}`,
	`.cdl-text{color:${dark.text}!important}`,
	`.cdl-muted{color:${dark.muted}!important}`,
	`.cdl-subtle{color:${dark.subtle}!important}`,
	`.cdl-ok{color:${constructive.dark.strong}!important;background-color:${constructive.dark.subtle}!important}`,
	...Object.values(MailAccentEnum).map(darkAccentRules),
	"}",
].join("");

// Les règles qu'un style en ligne ne peut pas porter. Des sélecteurs simples : Gmail ignore les autres
export const MAIL_STYLE_SHEET = `${BASE_RULES}${PHONE_RULES}${DARK_RULES}`;
