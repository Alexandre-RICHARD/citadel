import type { RequestStatus } from "./requestStatus.type.ts";

// Une demande déposée par la console et traitée par infra-ops (state/requests/)
export type RequestItem = {
	id: string;
	action: string;
	receivedAt: string | null;
	status: RequestStatus;
	// Code de sortie de citadel ; null tant que la demande tourne
	exitCode: number | null;
	log: string;
};
