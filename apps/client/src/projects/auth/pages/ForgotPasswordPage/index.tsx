import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum";
import { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum";
import { Navigate } from "react-router";

import { useFlow } from "../../api/flow/useFlow";
import { useMe } from "../../api/me/useMe";
import { MailCodeStep } from "../../components/MailCodeStep";
import { PageLoading } from "../../components/PageLoading";
import { SecondFactorPending } from "../../components/SecondFactorPending";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import { ForgotPasswordForm } from "./components/ForgotPasswordForm";
import { NewPasswordForm } from "./components/NewPasswordForm";

/**
 * Mot de passe oublié : l'identifiant, le lien ou le code du mail, le second facteur d'un compte protégé, puis le
 * nouveau mot de passe, qui ouvre la session. Connecté sans parcours en cours (déjà, ou à l'instant), la page renvoie
 * vers celle demandée au départ
 */
export function ForgotPasswordPage() {
	const me = useMe();
	const { flow } = useFlow();
	const redirectPath = useAuthRedirect();
	const isResetting = flow?.kind === FlowKindEnum.PASSWORD_RESET;

	if (me !== null && me !== undefined && !isResetting)
		return (
			<Navigate
				to={redirectPath}
				replace
			/>
		);
	if (flow === undefined) return <PageLoading />;
	if (isResetting && flow.step === FlowStepEnum.NEW_PASSWORD)
		return <NewPasswordForm />;
	if (isResetting && flow.step === FlowStepEnum.SECOND_FACTOR)
		return <SecondFactorPending />;
	if (isResetting)
		return (
			<MailCodeStep
				flow={flow}
				title="Vérifie tes emails"
				lead="Si un compte correspond, un email vient de partir à son adresse."
				purpose="pour choisir un nouveau mot de passe"
			/>
		);
	return <ForgotPasswordForm />;
}
