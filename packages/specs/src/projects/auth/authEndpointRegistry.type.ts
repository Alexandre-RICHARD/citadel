import type { ConfirmTotpFactor } from "./endpoint/factors/confirmTotpFactor/confirmTotpFactorEndpoint.interface.ts";
import type { CreateTotpFactor } from "./endpoint/factors/createTotpFactor/createTotpFactorEndpoint.interface.ts";
import type { StartEmailFactor } from "./endpoint/factors/startEmailFactor/startEmailFactorEndpoint.interface.ts";
import type { AbandonFlow } from "./endpoint/flow/abandonFlow/abandonFlowEndpoint.interface.ts";
import type { GetFlow } from "./endpoint/flow/getFlow/getFlowEndpoint.interface.ts";
import type { ResendFlowMail } from "./endpoint/flow/resendFlowMail/resendFlowMailEndpoint.interface.ts";
import type { SubmitFlowCode } from "./endpoint/flow/submitFlowCode/submitFlowCodeEndpoint.interface.ts";
import type { SubmitFlowLink } from "./endpoint/flow/submitFlowLink/submitFlowLinkEndpoint.interface.ts";
import type { SubmitNewPassword } from "./endpoint/flow/submitNewPassword/submitNewPasswordEndpoint.interface.ts";
import type { LoginWithPassword } from "./endpoint/login/loginWithPassword/loginWithPasswordEndpoint.interface.ts";
import type { StartMailLogin } from "./endpoint/login/startMailLogin/startMailLoginEndpoint.interface.ts";
import type { GetMe } from "./endpoint/me/getMe/getMeEndpoint.interface.ts";
import type { StartPasswordReset } from "./endpoint/passwordResets/startPasswordReset/startPasswordResetEndpoint.interface.ts";
import type { RegenerateRecoveryCodes } from "./endpoint/recoveryCodes/regenerateRecoveryCodes/regenerateRecoveryCodesEndpoint.interface.ts";
import type { StartRegistration } from "./endpoint/registrations/startRegistration/startRegistrationEndpoint.interface.ts";
import type { Logout } from "./endpoint/sessions/logout/logoutEndpoint.interface.ts";
import type { GetUsernameAvailability } from "./endpoint/usernames/getUsernameAvailability/getUsernameAvailabilityEndpoint.interface.ts";

export type AuthEndpointRegistry =
	| GetMe
	| Logout
	| GetFlow
	| AbandonFlow
	| ResendFlowMail
	| SubmitFlowCode
	| SubmitFlowLink
	| SubmitNewPassword
	| GetUsernameAvailability
	| StartRegistration
	| LoginWithPassword
	| StartMailLogin
	| StartPasswordReset
	| CreateTotpFactor
	| ConfirmTotpFactor
	| StartEmailFactor
	| RegenerateRecoveryCodes;
