import type { ContactAcknowledgementEnum } from "../contactAcknowledgement.enum.ts";

// La réponse à un message arrivé
export type ContactMessageReceiptDto = {
	acknowledgement: ContactAcknowledgementEnum;
};
