import type { ConfirmTotpFactor } from "./endpoint/factors/confirmTotpFactor/confirmTotpFactorEndpoint.interface.ts";
import type { CreateTotpFactor } from "./endpoint/factors/createTotpFactor/createTotpFactorEndpoint.interface.ts";
import type { DeleteFactor } from "./endpoint/factors/deleteFactor/deleteFactorEndpoint.interface.ts";
import type { ListFactors } from "./endpoint/factors/listFactors/listFactorsEndpoint.interface.ts";
import type { StartEmailFactor } from "./endpoint/factors/startEmailFactor/startEmailFactorEndpoint.interface.ts";
import type { AbandonFlow } from "./endpoint/flow/abandonFlow/abandonFlowEndpoint.interface.ts";
import type { GetFlow } from "./endpoint/flow/getFlow/getFlowEndpoint.interface.ts";
import type { ResendFlowMail } from "./endpoint/flow/resendFlowMail/resendFlowMailEndpoint.interface.ts";
import type { SubmitFlowCode } from "./endpoint/flow/submitFlowCode/submitFlowCodeEndpoint.interface.ts";
import type { SubmitFlowLink } from "./endpoint/flow/submitFlowLink/submitFlowLinkEndpoint.interface.ts";
import type { SubmitNewPassword } from "./endpoint/flow/submitNewPassword/submitNewPasswordEndpoint.interface.ts";
import type { SubmitSecondFactor } from "./endpoint/flow/submitSecondFactor/submitSecondFactorEndpoint.interface.ts";
import type { LoginWithPassword } from "./endpoint/login/loginWithPassword/loginWithPasswordEndpoint.interface.ts";
import type { StartMailLogin } from "./endpoint/login/startMailLogin/startMailLoginEndpoint.interface.ts";
import type { ChangePassword } from "./endpoint/me/changePassword/changePasswordEndpoint.interface.ts";
import type { DeleteMe } from "./endpoint/me/deleteMe/deleteMeEndpoint.interface.ts";
import type { ExportMyData } from "./endpoint/me/exportMyData/exportMyDataEndpoint.interface.ts";
import type { GetMe } from "./endpoint/me/getMe/getMeEndpoint.interface.ts";
import type { StartEmailChange } from "./endpoint/me/startEmailChange/startEmailChangeEndpoint.interface.ts";
import type { UpdateMe } from "./endpoint/me/updateMe/updateMeEndpoint.interface.ts";
import type { StartPasswordReset } from "./endpoint/passwordResets/startPasswordReset/startPasswordResetEndpoint.interface.ts";
import type { RegenerateRecoveryCodes } from "./endpoint/recoveryCodes/regenerateRecoveryCodes/regenerateRecoveryCodesEndpoint.interface.ts";
import type { StartRegistration } from "./endpoint/registrations/startRegistration/startRegistrationEndpoint.interface.ts";
import type { DeleteAllSessions } from "./endpoint/sessions/deleteAllSessions/deleteAllSessionsEndpoint.interface.ts";
import type { DeleteOtherSessions } from "./endpoint/sessions/deleteOtherSessions/deleteOtherSessionsEndpoint.interface.ts";
import type { DeleteSession } from "./endpoint/sessions/deleteSession/deleteSessionEndpoint.interface.ts";
import type { ListSessions } from "./endpoint/sessions/listSessions/listSessionsEndpoint.interface.ts";
import type { Logout } from "./endpoint/sessions/logout/logoutEndpoint.interface.ts";
import type { GetUsernameAvailability } from "./endpoint/usernames/getUsernameAvailability/getUsernameAvailabilityEndpoint.interface.ts";

export type AuthEndpointRegistry =
	| GetMe
	| UpdateMe
	| ChangePassword
	| ExportMyData
	| DeleteMe
	| StartEmailChange
	| Logout
	| ListSessions
	| DeleteSession
	| DeleteAllSessions
	| DeleteOtherSessions
	| GetFlow
	| AbandonFlow
	| ResendFlowMail
	| SubmitFlowCode
	| SubmitFlowLink
	| SubmitNewPassword
	| SubmitSecondFactor
	| GetUsernameAvailability
	| StartRegistration
	| LoginWithPassword
	| StartMailLogin
	| StartPasswordReset
	| ListFactors
	| CreateTotpFactor
	| ConfirmTotpFactor
	| StartEmailFactor
	| DeleteFactor
	| RegenerateRecoveryCodes;
