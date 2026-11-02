import type { ContactMessageUnsentBean } from "../../../bean/contactMessageUnsentBean.type.ts";
import type { ContactMessageUnsent } from "../../../models/ContactMessageUnsent.ts";

export function fromContactMessageUnsentEntityToContactMessageUnsentBean(
	contactMessageUnsent: ContactMessageUnsent,
): ContactMessageUnsentBean {
	return {
		id: contactMessageUnsent.id,
		subject: contactMessageUnsent.subject,
		message: contactMessageUnsent.message,
		email: contactMessageUnsent.email,
		name: contactMessageUnsent.name,
		createdAt: contactMessageUnsent.createdAt,
	};
}
