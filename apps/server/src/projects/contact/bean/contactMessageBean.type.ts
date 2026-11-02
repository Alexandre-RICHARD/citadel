// Un message du formulaire de contact, validé. N'existe que le temps de la requête, sauf si sa notification ne peut pas
// partir : il est alors gardé en base (mailing_contact_message_unsent)
export type ContactMessageBean = {
	subject: string;
	message: string;
	email: string | null;
	name: string | null;
	// Le champ piège est rempli : un robot, à qui l'on répond comme à un humain sans rien envoyer
	isHoneypotFilled: boolean;
	// Pour la limite de messages par heure, jamais écrite ailleurs
	ip: string;
};
