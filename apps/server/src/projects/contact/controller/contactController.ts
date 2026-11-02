import type { SendContactMessage } from "@citadel/specs/src/projects/contact/endpoint/messages/sendContactMessage/sendContactMessageEndpoint.interface.ts";
import type { GetContactUnsentCount } from "@citadel/specs/src/projects/contact/endpoint/unsent/getContactUnsentCount/getContactUnsentCountEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { fromSendContactMessageDtoToContactMessageBean } from "../mapper/dtoBean/fromSendContactMessageDtoToContactMessageBean.ts";
import { contactService } from "../service/contactService.ts";

export const contactController = {
	sendMessage: asyncRequestHandler<SendContactMessage>(
		async (request, response) => {
			// `request.ip` : l'IP réelle, posée par le middleware realClientIp
			const contactMessageBean = fromSendContactMessageDtoToContactMessageBean(
				request.body,
				request.ip ?? "unknown",
			);

			const acknowledgement =
				await contactService.sendMessage(contactMessageBean);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json({ acknowledgement });
		},
	),

	getUnsentCount: asyncRequestHandler<GetContactUnsentCount>(
		async (_request, response) => {
			const count = await contactService.countUnsentMessages();

			return response.status(HttpStatutCodeSuccessEnum.SUCCESS).json({ count });
		},
	),
};
