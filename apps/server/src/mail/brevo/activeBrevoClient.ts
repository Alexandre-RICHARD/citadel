import { env } from "../../configuration/env.ts";
import { MailSenderKindEnum } from "../sender/mailSenderKind.enum.ts";
import { BrevoClient } from "./brevoClient.ts";

// Brevo seulement quand MAIL_SENDER le dit : la pré-prod, qui tourne sur .env.prod (et sa clé), n'envoie jamais rien
export const activeBrevoClient =
	env.MAIL_SENDER === MailSenderKindEnum.BREVO
		? new BrevoClient(env.BREVO_API_KEY)
		: null;
