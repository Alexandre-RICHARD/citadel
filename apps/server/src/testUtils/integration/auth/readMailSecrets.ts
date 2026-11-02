import type { Mail } from "../../../mail/mail.type.ts";

const CODE_LINE = /Ton code : (?<code>\d{6})/u;
const VERIFY_LINK = /\/auth\/verify#(?<linkToken>[\w-]{43})/u;

// Le code et le jeton du lien d'un mail de parcours, lus dans sa version texte comme le ferait le destinataire
export function readMailSecrets(mail: Mail): {
	code: string;
	linkToken: string;
} {
	const code = CODE_LINE.exec(mail.text)?.groups?.code;
	const linkToken = VERIFY_LINK.exec(mail.text)?.groups?.linkToken;
	if (code === undefined || linkToken === undefined)
		throw new Error(`No code or link in the ${mail.kind} mail`);
	return { code, linkToken };
}
