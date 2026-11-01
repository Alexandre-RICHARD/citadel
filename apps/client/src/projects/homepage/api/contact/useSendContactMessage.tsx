import type { SendContactMessageBodyDto } from "@citadel/specs/src/projects/contact/endpoint/messages/sendContactMessage/sendContactMessageBodyDto.type";
import type { SendContactMessage } from "@citadel/specs/src/projects/contact/endpoint/messages/sendContactMessage/sendContactMessageEndpoint.interface";
import { ContactErrorCodeEnum } from "@citadel/specs/src/projects/contact/error/contactErrorCode.enum";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "../../../../common/api/error/ApiError";
import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { mailStatusQueryOptions } from "../../../../common/api/mail/mailStatusQueryOptions";

// Pas d'optimisme : le visiteur ne voit le succès qu'une fois la notification partie, et garde son texte sinon
export function useSendContactMessage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body: SendContactMessageBodyDto) => {
			await fetchHandler<SendContactMessage>({
				url: `${ApiPrefixEnum.CONTACT}/messages`,
				method: HttpMethodEnum.POST,
				protected: false,
				body,
			});
		},
		onError: (error) => {
			// Le quota a fermé le formulaire depuis le chargement : le site entier le sait (bandeau, formulaire désactivé)
			if (
				error instanceof ApiError &&
				error.code === ContactErrorCodeEnum.CONTACT_CLOSED
			)
				void queryClient.invalidateQueries({
					queryKey: mailStatusQueryOptions.queryKey,
				});
		},
	});
}
