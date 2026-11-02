// Une inscription telle que le formulaire l'envoie, déjà validée par les specs
export type RegistrationBean = {
	email: string;
	username: string;
	password: string;
	remember: boolean;
	// Champ piège : rempli, c'est un robot
	isHoneypotFilled: boolean;
};
