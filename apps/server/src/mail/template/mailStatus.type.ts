// Une ligne d'un bloc « statuts » : ce qui est ouvert ou fermé, et pourquoi
export type MailStatus = {
	label: string;
	detail: string;
	state: string;
	// Fermé, arrêté : en rouge ; sinon en vert
	isAlert: boolean;
};
