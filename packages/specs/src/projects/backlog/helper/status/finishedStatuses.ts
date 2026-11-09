import { StatusEnum } from "../../enum/status.enum.ts";
import { isFinishedStatus } from "./isFinishedStatus.ts";

// Les statuts qui comptent comme une fin, de quoi les chercher en base
export const finishedStatuses: readonly StatusEnum[] =
	Object.values(StatusEnum).filter(isFinishedStatus);
