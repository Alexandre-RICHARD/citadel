import type { FlowStatusDto } from "@citadel/specs/src/projects/auth/dto/flowStatusDto.type";

// La réponse telle qu'elle est gardée en cache, avec l'heure de sa réception : ses durées en secondes en partent
export type ReceivedFlowStatus = {
	status: FlowStatusDto;
	receivedAt: number;
};
