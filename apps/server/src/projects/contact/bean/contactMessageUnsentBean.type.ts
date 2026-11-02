// Un message de contact gardé en base faute d'avoir pu être notifié, en attente de la relance du soir
export type ContactMessageUnsentBean = {
	id: number;
	subject: string;
	message: string;
	email: string | null;
	name: string | null;
	// Le moment où le visiteur a écrit
	createdAt: Date;
};
