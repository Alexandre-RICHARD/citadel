import type { SendContactMessage } from "./endpoint/messages/sendContactMessage/sendContactMessageEndpoint.interface.ts";
import type { GetContactUnsentCount } from "./endpoint/unsent/getContactUnsentCount/getContactUnsentCountEndpoint.interface.ts";
import type { RetryContactUnsent } from "./endpoint/unsent/retryContactUnsent/retryContactUnsentEndpoint.interface.ts";

export type ContactEndpointRegistry =
	SendContactMessage | GetContactUnsentCount | RetryContactUnsent;
