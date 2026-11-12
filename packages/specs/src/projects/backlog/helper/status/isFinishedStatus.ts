import { StatusEnum } from "../../enum/status.enum.ts";

// Les statuts de fin : ils comptent le jeu comme fini (récap, statut de la ligne d'un jeu). « Vu sans jouer » en est un
const FINISHED_STATUSES: readonly StatusEnum[] = [
	StatusEnum.WATCHED,
	StatusEnum.FINISHED,
	StatusEnum.DEEMED_FINISHED,
	StatusEnum.COMPLETED,
	StatusEnum.PLATINUM,
	StatusEnum.COMPLETED_AND_PLATINUM,
];

export function isFinishedStatus(status: StatusEnum): boolean {
	return FINISHED_STATUSES.includes(status);
}
