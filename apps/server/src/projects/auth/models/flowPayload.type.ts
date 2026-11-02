// Le compte d'une inscription, créé à la confirmation
type RegistrationPayload = {
	username: string;
	passwordHash: string;
};

// L'adresse qui remplacera celle du compte, à la confirmation
type EmailChangePayload = {
	newEmail: string;
};

// Colonne JSON auth_flow.payload : vide pour les autres parcours
export type FlowPayload = RegistrationPayload | EmailChangePayload;
