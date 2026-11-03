import type { AuthEndpointRegistry } from "@citadel/specs/src/projects/auth/authEndpointRegistry.type.ts";
import { confirmTotpFactorBodySchema } from "@citadel/specs/src/projects/auth/endpoint/factors/confirmTotpFactor/confirmTotpFactorBodySchema.ts";
import { createTotpFactorBodySchema } from "@citadel/specs/src/projects/auth/endpoint/factors/createTotpFactor/createTotpFactorBodySchema.ts";
import { submitFlowCodeBodySchema } from "@citadel/specs/src/projects/auth/endpoint/flow/submitFlowCode/submitFlowCodeBodySchema.ts";
import { submitFlowLinkBodySchema } from "@citadel/specs/src/projects/auth/endpoint/flow/submitFlowLink/submitFlowLinkBodySchema.ts";
import { submitNewPasswordBodySchema } from "@citadel/specs/src/projects/auth/endpoint/flow/submitNewPassword/submitNewPasswordBodySchema.ts";
import { loginWithPasswordBodySchema } from "@citadel/specs/src/projects/auth/endpoint/login/loginWithPassword/loginWithPasswordBodySchema.ts";
import { startMailLoginBodySchema } from "@citadel/specs/src/projects/auth/endpoint/login/startMailLogin/startMailLoginBodySchema.ts";
import { startPasswordResetBodySchema } from "@citadel/specs/src/projects/auth/endpoint/passwordResets/startPasswordReset/startPasswordResetBodySchema.ts";
import { startRegistrationBodySchema } from "@citadel/specs/src/projects/auth/endpoint/registrations/startRegistration/startRegistrationBodySchema.ts";
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
import { registrationController } from "./controller/registrationController.ts";
import { sessionController } from "./controller/sessionController.ts";
import { usernameController } from "./controller/usernameController.ts";

const expressRouter = ExpressRouter();

const typedRouter =
	createTypedExpressRouter<AuthEndpointRegistry>(expressRouter);

typedRouter.GET(`${ApiPrefixEnum.AUTH}/me`, meController.getMe);
typedRouter.POST(`${ApiPrefixEnum.AUTH}/logout`, sessionController.logout);

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

export const authRouter = expressRouter;
