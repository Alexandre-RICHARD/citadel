import type { FlowStatusDto } from "@citadel/specs/src/projects/auth/dto/flowStatusDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { authQueryKeys } from "../authQueryKeys";
import type { ReceivedFlowStatus } from "../model/receivedFlowStatus.type";

/**
 * Chaque étape répond où en est le parcours : la réponse devient l'état du cache, sans relecture. Plus de parcours : la
 * session a pu s'ouvrir, « qui est connecté » est à relire
 */
export function writeFlowStatus(
	queryClient: QueryClient,
	status: FlowStatusDto,
	receivedAt: number,
): void {
	queryClient.setQueryData<ReceivedFlowStatus>(authQueryKeys.flow(), {
		status,
		receivedAt,
	});
	if (status.flow === null)
		void queryClient.invalidateQueries({ queryKey: authQueryKeys.me() });
}
