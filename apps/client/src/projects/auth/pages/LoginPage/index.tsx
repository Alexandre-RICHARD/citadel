import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum";
import { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum";
import { Navigate } from "react-router";

import { useFlow } from "../../api/flow/useFlow";
import { useMe } from "../../api/me/useMe";
import { MailCodeStep } from "../../components/MailCodeStep";
import { PageLoading } from "../../components/PageLoading";
import { SecondFactorPending } from "../../components/SecondFactorPending";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import { LoginForm } from "./components/LoginForm";

// Les parcours de la connexion : mot de passe, ou lien par email, puis le second facteur d'un compte protégé
const LOGIN_FLOW_KINDS: readonly FlowKindEnum[] = [
	FlowKindEnum.LOGIN,
	FlowKindEnum.MAIL_LOGIN,
];

// La connexion. Déjà connecté (ou connecté à l'instant), la page renvoie vers celle demandée au départ
export function LoginPage() {
	const me = useMe();
	const { flow } = useFlow();
	const redirectPath = useAuthRedirect();

	if (me !== null && me !== undefined)
		return (
			<Navigate
				to={redirectPath}
				replace
			/>
		);
	if (flow === undefined) return <PageLoading />;
	if (flow !== null && LOGIN_FLOW_KINDS.includes(flow.kind)) {
		if (flow.step === FlowStepEnum.SECOND_FACTOR)
			return <SecondFactorPending />;
		return (
			<MailCodeStep
				flow={flow}
				title="Vérifie tes emails"
				lead="Si un compte correspond et accepte la connexion par email, un email vient de partir à son adresse."
				purpose="pour te connecter"
			/>
		);
	}
	return <LoginForm />;
}
