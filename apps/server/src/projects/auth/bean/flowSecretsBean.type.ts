// Le code et le lien d'un mail de parcours : en clair pour le mail, seulement leurs empreintes pour la base
export type FlowSecretsBean = {
	code: string;
	linkToken: string;
	codeHmac: Buffer;
	linkTokenHash: Buffer;
};
