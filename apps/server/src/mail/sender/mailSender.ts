import { env } from "../../configuration/env.ts";
import { activeBrevoClient } from "../brevo/activeBrevoClient.ts";
import { journalMailSender } from "./journalMailSender.ts";
import type { MailSender } from "./mailSender.type.ts";
import { MailSenderKindEnum } from "./mailSenderKind.enum.ts";
import { memoryMailSender } from "./memoryMailSender.ts";

function selectMailSender(): MailSender {
	if (activeBrevoClient !== null) {
		const brevoClient = activeBrevoClient;
		return { send: async (mail) => brevoClient.sendEmail(mail) };
	}
	if (env.MAIL_SENDER === MailSenderKindEnum.MEMORY) return memoryMailSender;
	return journalMailSender;
}

// L'expéditeur choisi par MAIL_SENDER
export const mailSender = selectMailSender();
