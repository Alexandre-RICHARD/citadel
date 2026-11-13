// Le code et le lien d'un email de parcours : en clair pour l'email, seulement leurs empreintes pour la base
export type FlowSecretsBean = {
	code: string;
	linkToken: string;
	codeHmac: Buffer;
	linkTokenHash: Buffer;
};
