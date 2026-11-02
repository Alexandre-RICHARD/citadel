import type { SendContactMessage } from "./endpoint/messages/sendContactMessage/sendContactMessageEndpoint.interface.ts";
import type { GetContactUnsentCount } from "./endpoint/unsent/getContactUnsentCount/getContactUnsentCountEndpoint.interface.ts";

export type ContactEndpointRegistry =
	SendContactMessage | GetContactUnsentCount;
