// Une connexion par mot de passe, telle que le formulaire l'envoie
export type PasswordLoginBean = {
	// Email ou pseudo
	identifier: string;
	password: string;
	remember: boolean;
};
