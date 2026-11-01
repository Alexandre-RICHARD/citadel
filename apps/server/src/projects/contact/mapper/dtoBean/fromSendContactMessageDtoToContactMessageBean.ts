import type { SendContactMessageBodyDto } from "@citadel/specs/src/projects/contact/endpoint/messages/sendContactMessage/sendContactMessageBodyDto.type.ts";

import type { ContactMessageBean } from "../../bean/contactMessageBean.type.ts";

export function fromSendContactMessageDtoToContactMessageBean(
	sendContactMessageBodyDto: SendContactMessageBodyDto,
	ip: string,
): ContactMessageBean {
	const contactMessageBean = {
		subject: sendContactMessageBodyDto.subject,
		message: sendContactMessageBodyDto.message,
		email: sendContactMessageBodyDto.email,
		name: sendContactMessageBodyDto.name,
		isHoneypotFilled: sendContactMessageBodyDto.website !== "",
		ip,
	};
	return contactMessageBean;
}
