import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum";
import { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum";
import { useState } from "react";
import { Navigate } from "react-router";

import { useFlow } from "../../api/flow/useFlow";
import { useMe } from "../../api/me/useMe";
import { MailCodeStep } from "../../components/MailCodeStep";
import { PageLoading } from "../../components/PageLoading";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import { useStoredFields } from "../../hooks/useStoredFields";
import { findCompletionPath } from "../../routing/findCompletionPath";
import { RegistrationForm } from "./components/RegistrationForm";
import { EMPTY_REGISTRATION_FIELDS } from "./emptyRegistrationFields";
import { REGISTRATION_FIELDS_KEY } from "./registrationFieldsKey";

// L'inscription : le formulaire, puis le lien ou le code du mail. Connecté (déjà, ou par l'inscription qui vient de se
// terminer), la page renvoie vers celle demandée au départ
export function RegisterPage() {
	const me = useMe();
	const { flow } = useFlow();
	const redirectPath = useAuthRedirect();
	// L'inscription qui vient de se terminer propose de protéger le compte ; une personne déjà connectée repart d'ici
	const [wasRegistering, setWasRegistering] = useState(false);
	if (!wasRegistering && flow?.kind === FlowKindEnum.REGISTRATION)
		setWasRegistering(true);
	const { fields } = useStoredFields(
		REGISTRATION_FIELDS_KEY,
		EMPTY_REGISTRATION_FIELDS,
	);

	if (me !== null && me !== undefined)
		return (
			<Navigate
				to={findCompletionPath(
					wasRegistering ? FlowKindEnum.REGISTRATION : undefined,
					redirectPath,
				)}
				replace
			/>
		);
	if (flow === undefined) return <PageLoading />;
	if (
		flow?.kind === FlowKindEnum.REGISTRATION &&
		flow.step === FlowStepEnum.MAIL_CODE
	)
		return (
			<MailCodeStep
				flow={flow}
				title="Confirme ton adresse email"
				lead={
					fields.email === "" ? (
						"Un email est parti à l’adresse indiquée."
					) : (
						<>
							Un email est parti à <strong>{fields.email}</strong>.
						</>
					)
				}
				purpose="pour terminer ton inscription"
				canReplaceUsername
			/>
		);
	return <RegistrationForm />;
}
