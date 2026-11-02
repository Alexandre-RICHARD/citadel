import type { StartRegistrationBodyDto } from "@citadel/specs/src/projects/auth/endpoint/registrations/startRegistration/startRegistrationBodyDto.type.ts";

import type { RegistrationBean } from "../../../bean/registrationBean.type.ts";

export function fromStartRegistrationBodyDtoToRegistrationBean(
	body: StartRegistrationBodyDto,
): RegistrationBean {
	return {
		email: body.email,
		username: body.username,
		password: body.password,
		remember: body.remember,
		isHoneypotFilled: body.website !== "",
	};
}
