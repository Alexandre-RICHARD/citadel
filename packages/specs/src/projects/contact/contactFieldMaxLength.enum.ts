// Longueurs maximales des champs du formulaire de contact, en caractères
export enum ContactFieldMaxLengthEnum {
	// Repris dans l'objet de la notification et dans l'accusé de réception : court
	SUBJECT = 150,
	MESSAGE = 5000,
	NAME = 100,
	// La plus longue adresse email possible (RFC 5321)
	EMAIL = 254,
}
