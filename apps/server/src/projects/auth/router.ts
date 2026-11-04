import type { AuthEndpointRegistry } from "@citadel/specs/src/projects/auth/authEndpointRegistry.type.ts";
import { confirmTotpFactorBodySchema } from "@citadel/specs/src/projects/auth/endpoint/factors/confirmTotpFactor/confirmTotpFactorBodySchema.ts";
import { createTotpFactorBodySchema } from "@citadel/specs/src/projects/auth/endpoint/factors/createTotpFactor/createTotpFactorBodySchema.ts";
import { deleteFactorBodySchema } from "@citadel/specs/src/projects/auth/endpoint/factors/deleteFactor/deleteFactorBodySchema.ts";
import { deleteFactorPathParamSchema } from "@citadel/specs/src/projects/auth/endpoint/factors/deleteFactor/deleteFactorPathParamSchema.ts";
import { submitFlowCodeBodySchema } from "@citadel/specs/src/projects/auth/endpoint/flow/submitFlowCode/submitFlowCodeBodySchema.ts";
import { submitFlowLinkBodySchema } from "@citadel/specs/src/projects/auth/endpoint/flow/submitFlowLink/submitFlowLinkBodySchema.ts";
import { submitNewPasswordBodySchema } from "@citadel/specs/src/projects/auth/endpoint/flow/submitNewPassword/submitNewPasswordBodySchema.ts";
import { submitSecondFactorBodySchema } from "@citadel/specs/src/projects/auth/endpoint/flow/submitSecondFactor/submitSecondFactorBodySchema.ts";
import { loginWithPasswordBodySchema } from "@citadel/specs/src/projects/auth/endpoint/login/loginWithPassword/loginWithPasswordBodySchema.ts";
import { startMailLoginBodySchema } from "@citadel/specs/src/projects/auth/endpoint/login/startMailLogin/startMailLoginBodySchema.ts";
import { changePasswordBodySchema } from "@citadel/specs/src/projects/auth/endpoint/me/changePassword/changePasswordBodySchema.ts";
import { deleteMeBodySchema } from "@citadel/specs/src/projects/auth/endpoint/me/deleteMe/deleteMeBodySchema.ts";
import { startEmailChangeBodySchema } from "@citadel/specs/src/projects/auth/endpoint/me/startEmailChange/startEmailChangeBodySchema.ts";
import { updateMeBodySchema } from "@citadel/specs/src/projects/auth/endpoint/me/updateMe/updateMeBodySchema.ts";
import { startPasswordResetBodySchema } from "@citadel/specs/src/projects/auth/endpoint/passwordResets/startPasswordReset/startPasswordResetBodySchema.ts";
import { regenerateRecoveryCodesBodySchema } from "@citadel/specs/src/projects/auth/endpoint/recoveryCodes/regenerateRecoveryCodes/regenerateRecoveryCodesBodySchema.ts";
import { startRegistrationBodySchema } from "@citadel/specs/src/projects/auth/endpoint/registrations/startRegistration/startRegistrationBodySchema.ts";
import { deleteSessionPathParamSchema } from "@citadel/specs/src/projects/auth/endpoint/sessions/deleteSession/deleteSessionPathParamSchema.ts";
import { getUsernameAvailabilityPathParamSchema } from "@citadel/specs/src/projects/auth/endpoint/usernames/getUsernameAvailability/getUsernameAvailabilityPathParamSchema.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { Router as ExpressRouter } from "express";

import { createTypedExpressRouter } from "../../common/routing/createTypedExpressRouter.ts";
import { requestValidator } from "../../middleware/requestValidator.ts";
import { factorController } from "./controller/factorController.ts";
import { flowController } from "./controller/flowController.ts";
import { loginController } from "./controller/loginController.ts";
import { meController } from "./controller/meController.ts";
import { passwordResetController } from "./controller/passwordResetController.ts";
import { recoveryCodeController } from "./controller/recoveryCodeController.ts";
import { registrationController } from "./controller/registrationController.ts";
import { sessionController } from "./controller/sessionController.ts";
import { usernameController } from "./controller/usernameController.ts";

const expressRouter = ExpressRouter();

const typedRouter =
	createTypedExpressRouter<AuthEndpointRegistry>(expressRouter);

typedRouter.GET(`${ApiPrefixEnum.AUTH}/me`, meController.getMe);
typedRouter.PATCH(
	`${ApiPrefixEnum.AUTH}/me`,
	meController.updateMe,
	requestValidator({ body: updateMeBodySchema }),
);
typedRouter.GET(`${ApiPrefixEnum.AUTH}/me/export`, meController.exportMyData);
typedRouter.DELETE(
	`${ApiPrefixEnum.AUTH}/me`,
	meController.deleteMe,
	requestValidator({ body: deleteMeBodySchema }),
);
typedRouter.POST(
	`${ApiPrefixEnum.AUTH}/me/password`,
	meController.changePassword,
	requestValidator({ body: changePasswordBodySchema }),
);
typedRouter.POST(
	`${ApiPrefixEnum.AUTH}/me/email`,
	meController.startEmailChange,
	requestValidator({ body: startEmailChangeBodySchema }),
);
typedRouter.POST(`${ApiPrefixEnum.AUTH}/logout`, sessionController.logout);

typedRouter.GET(`${ApiPrefixEnum.AUTH}/sessions`, sessionController.list);
// « others » avant « :sessionId », qui le prendrait pour un id
typedRouter.DELETE(
	`${ApiPrefixEnum.AUTH}/sessions/others`,
	sessionController.deleteOthers,
);
typedRouter.DELETE(
	`${ApiPrefixEnum.AUTH}/sessions/:sessionId`,
	sessionController.delete,
	requestValidator({ params: deleteSessionPathParamSchema }),
);
typedRouter.DELETE(
	`${ApiPrefixEnum.AUTH}/sessions`,
	sessionController.deleteAll,
);

typedRouter.GET(
	`${ApiPrefixEnum.AUTH}/usernames/:username/availability`,
	usernameController.getAvailability,
	requestValidator({ params: getUsernameAvailabilityPathParamSchema }),
);
typedRouter.POST(
	`${ApiPrefixEnum.AUTH}/registrations`,
	registrationController.startRegistration,
	requestValidator({ body: startRegistrationBodySchema }),
);
typedRouter.POST(
	`${ApiPrefixEnum.AUTH}/login/password`,
	loginController.loginWithPassword,
	requestValidator({ body: loginWithPasswordBodySchema }),
);
typedRouter.POST(
	`${ApiPrefixEnum.AUTH}/login/mail`,
	loginController.startMailLogin,
	requestValidator({ body: startMailLoginBodySchema }),
);
typedRouter.POST(
	`${ApiPrefixEnum.AUTH}/password-resets`,
	passwordResetController.startPasswordReset,
	requestValidator({ body: startPasswordResetBodySchema }),
);

typedRouter.GET(`${ApiPrefixEnum.AUTH}/flow`, flowController.getFlow);
typedRouter.DELETE(`${ApiPrefixEnum.AUTH}/flow`, flowController.abandonFlow);
typedRouter.POST(
	`${ApiPrefixEnum.AUTH}/flow/resend`,
	flowController.resendMail,
);
typedRouter.POST(
	`${ApiPrefixEnum.AUTH}/flow/code`,
	flowController.submitCode,
	requestValidator({ body: submitFlowCodeBodySchema }),
);
typedRouter.POST(
	`${ApiPrefixEnum.AUTH}/flow/link`,
	flowController.submitLink,
	requestValidator({ body: submitFlowLinkBodySchema }),
);
typedRouter.POST(
	`${ApiPrefixEnum.AUTH}/flow/new-password`,
	flowController.submitNewPassword,
	requestValidator({ body: submitNewPasswordBodySchema }),
);
typedRouter.POST(
	`${ApiPrefixEnum.AUTH}/flow/second-factor`,
	flowController.submitSecondFactor,
	requestValidator({ body: submitSecondFactorBodySchema }),
);

typedRouter.GET(`${ApiPrefixEnum.AUTH}/factors`, factorController.list);
typedRouter.POST(
	`${ApiPrefixEnum.AUTH}/factors/totp`,
	factorController.createTotp,
	requestValidator({ body: createTotpFactorBodySchema }),
);
typedRouter.POST(
	`${ApiPrefixEnum.AUTH}/factors/totp/confirm`,
	factorController.confirmTotp,
	requestValidator({ body: confirmTotpFactorBodySchema }),
);
typedRouter.POST(
	`${ApiPrefixEnum.AUTH}/factors/email`,
	factorController.startEmailFactor,
);
typedRouter.DELETE(
	`${ApiPrefixEnum.AUTH}/factors/:factorId`,
	factorController.delete,
	requestValidator({
		params: deleteFactorPathParamSchema,
		body: deleteFactorBodySchema,
	}),
);
typedRouter.POST(
	`${ApiPrefixEnum.AUTH}/recovery-codes`,
	recoveryCodeController.regenerate,
	requestValidator({ body: regenerateRecoveryCodesBodySchema }),
);

export const authRouter = expressRouter;
