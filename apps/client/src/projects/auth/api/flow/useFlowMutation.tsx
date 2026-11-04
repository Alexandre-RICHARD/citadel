import type { FlowStatusDto } from "@citadel/specs/src/projects/auth/dto/flowStatusDto.type";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "../../../../common/api/error/ApiError";
import { mailStatusQueryOptions } from "../../../../common/api/mail/mailStatusQueryOptions";
import { authQueryKeys } from "../authQueryKeys";
import { writeFlowStatus } from "../cache/writeFlowStatus";
import { writeNewRecoveryCodes } from "../cache/writeNewRecoveryCodes";

// L'état du parcours a changé : il n'est plus là (la page revient au formulaire de départ), ou il lui reste moins d'essais
const FLOW_CHANGED_CODES: readonly string[] = [
	AuthErrorCodeEnum.FLOW_EXPIRED,
	AuthErrorCodeEnum.INVALID_CODE,
	AuthErrorCodeEnum.CODE_ATTEMPTS_EXHAUSTED,
];
// Le quota a fermé les mails depuis le chargement : tout le site le sait (bandeau, boutons désactivés)
const MAIL_CLOSED_CODES: readonly string[] = [
	AuthErrorCodeEnum.MAIL_CLOSED,
	AuthErrorCodeEnum.REGISTRATION_CLOSED,
];

/**
 * Une étape de parcours : sa réponse devient l'état du parcours. Pas d'optimisme, chaque étape attend le serveur (code
 * juste ou faux, mail parti ou non). Le parcours qui active le premier facteur du compte donne ses codes de secours, mis
 * de côté pour être montrés une seule fois
 */
export function useFlowMutation<Variables>(
	send: (variables: Variables) => Promise<FlowStatusDto>,
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: send,
		onSuccess: (status) => {
			if (status.recoveryCodes !== undefined) {
				writeNewRecoveryCodes(queryClient, status.recoveryCodes);
				void queryClient.invalidateQueries({
					queryKey: authQueryKeys.factors(),
				});
			}
			writeFlowStatus(queryClient, status, Date.now());
		},
		onError: (error) => {
			if (!(error instanceof ApiError) || error.code === null) return;
			if (FLOW_CHANGED_CODES.includes(error.code))
				void queryClient.invalidateQueries({ queryKey: authQueryKeys.flow() });
			if (MAIL_CLOSED_CODES.includes(error.code))
				void queryClient.invalidateQueries({
					queryKey: mailStatusQueryOptions.queryKey,
				});
		},
	});
}
