type TableOptions = {
	width?: string;
	className?: string;
	style?: string;
};

// La mise en page d'un email se fait en tableaux : le seul agencement que tous les clients email respectent, Outlook
// compris. `role="presentation"` les fait ignorer des lecteurs d'écran
export function presentationTable(
	rows: string,
	{ width, className, style = "" }: TableOptions = {},
): string {
	const attributes = [
		'role="presentation" cellpadding="0" cellspacing="0" border="0"',
		width === undefined ? null : `width="${width}"`,
		className === undefined ? null : `class="${className}"`,
		`style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;${style}"`,
	].filter((attribute) => attribute !== null);
	return `<table ${attributes.join(" ")}>${rows}</table>`;
}
