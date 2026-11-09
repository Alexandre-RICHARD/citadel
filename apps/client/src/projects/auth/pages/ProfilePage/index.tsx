import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum";
import { Navigate } from "react-router";

import { useNewRecoveryCodes } from "../../api/cache/useNewRecoveryCodes";
import { useFlow } from "../../api/flow/useFlow";
import { useMe } from "../../api/me/useMe";
import { MailCodeStep } from "../../components/MailCodeStep";
import { PageLoading } from "../../components/PageLoading";
import { RecoveryCodesDialog } from "../../components/RecoveryCodesDialog";
import { AuthPathEnum } from "../../routing/authPath.enum";
import { buildLoginPath } from "../../routing/buildLoginPath";
import { DataSection } from "./components/DataSection";
import { IdentitySection } from "./components/IdentitySection";
import { LoginMethodsSection } from "./components/LoginMethodsSection";
import { PasswordSection } from "./components/PasswordSection";
import { SecondFactorSection } from "./components/SecondFactorSection";
import { SessionsSection } from "./components/SessionsSection";
import styles from "./profilePage.module.scss";

const PROFILE_REDIRECT = buildLoginPath(AuthPathEnum.PROFILE);

// Le profil : tout ce que le compte permet de changer. Un parcours du profil en cours (nouvelle adresse email, code par
// email à activer) prend la place de la page jusqu'à la saisie du code ou du lien ; les codes de secours qui viennent
// d'être donnés s'affichent dans une fenêtre au-dessus de la page, car ils ne reviendront pas
export function ProfilePage() {
	const me = useMe();
	const { flow } = useFlow();
	const { recoveryCodes, acknowledge } = useNewRecoveryCodes();

	if (me === undefined || flow === undefined) return <PageLoading />;
	if (me === null)
		return (
			<Navigate
				to={PROFILE_REDIRECT}
				replace
			/>
		);

	if (flow?.kind === FlowKindEnum.EMAIL_CHANGE)
		return (
			<MailCodeStep
				flow={flow}
				title="Confirme ta nouvelle adresse email"
				lead="Un email vient de partir à la nouvelle adresse."
				purpose="pour confirmer cette adresse"
			/>
		);
	if (flow?.kind === FlowKindEnum.EMAIL_FACTOR)
		return (
			<MailCodeStep
				flow={flow}
				title="Active le code par email"
				lead="Un email vient de partir à l’adresse de ton compte."
				purpose="pour activer le code par email"
			/>
		);

	return (
		<div className={styles.page}>
			{recoveryCodes !== null && (
				<RecoveryCodesDialog
					codes={recoveryCodes}
					email={me.email}
					onAcknowledge={acknowledge}
				/>
			)}
			<h1 className={styles.title}>Ton profil</h1>
			<IdentitySection me={me} />
			<PasswordSection />
			<LoginMethodsSection me={me} />
			<SecondFactorSection />
			<SessionsSection />
			<DataSection />
		</div>
	);
}
