import { MAIL_FONTS } from "./mailFonts.ts";

type FontOptions = {
	family?: keyof typeof MAIL_FONTS;
	size: number;
	weight?: number;
	lineHeight: number;
	color: string;
};

// Propriétés séparées plutôt que le raccourci `font`, que Outlook lit mal
export function fontStyle({
	family = "text",
	size,
	weight = 400,
	lineHeight,
	color,
}: FontOptions): string {
	return `font-family:${MAIL_FONTS[family]};font-size:${size}px;font-weight:${weight};line-height:${lineHeight};color:${color};`;
}
