import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum";

import { AuthPathEnum } from "./authPath.enum";

const FLOW_PAGES: Record<FlowKindEnum, AuthPathEnum> = {
	[FlowKindEnum.REGISTRATION]: AuthPathEnum.REGISTER,
	[FlowKindEnum.LOGIN]: AuthPathEnum.LOGIN,
	[FlowKindEnum.MAIL_LOGIN]: AuthPathEnum.LOGIN,
	[FlowKindEnum.PASSWORD_RESET]: AuthPathEnum.FORGOT_PASSWORD,
	// Les parcours du profil
	[FlowKindEnum.EMAIL_CHANGE]: AuthPathEnum.PROFILE,
	[FlowKindEnum.EMAIL_FACTOR]: AuthPathEnum.PROFILE,
};

// La page où un parcours continue, après la validation de son lien sur /auth/verify
export function findFlowPagePath(kind: FlowKindEnum): AuthPathEnum {
	return FLOW_PAGES[kind];
}
