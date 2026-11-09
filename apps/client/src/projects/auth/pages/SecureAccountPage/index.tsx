import { ShieldCheck } from "lucide-react";
import { Navigate, useNavigate } from "react-router";

import { useNewRecoveryCodes } from "../../api/cache/useNewRecoveryCodes";
import { useMe } from "../../api/me/useMe";
import { AuthCard } from "../../components/AuthCard";
import { PageLoading } from "../../components/PageLoading";
import { RecoveryCodesPanel } from "../../components/RecoveryCodesPanel";
import { TotpSetupForm } from "../../components/TotpSetupForm";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import { AuthPathEnum } from "../../routing/authPath.enum";

// L'étape facultative qui suit l'inscription : protéger le compte avec une application d'authentification. « Passer cette étape »
// et la fin des codes de secours mènent à la page demandée au départ ; le profil propose la même chose à tout moment
export function SecureAccountPage() {
	const me = useMe();
	const navigate = useNavigate();
	const redirectPath = useAuthRedirect();
	const { recoveryCodes, acknowledge } = useNewRecoveryCodes();

	function leave(): void {
		void navigate(redirectPath, { replace: true });
	}

	if (me === undefined) return <PageLoading />;
	if (me === null)
		return (
			<Navigate
				to={AuthPathEnum.LOGIN}
				replace
			/>
		);

	if (recoveryCodes !== null)
		return (
			<RecoveryCodesPanel
				codes={recoveryCodes}
				email={me.email}
				onAcknowledge={() => {
					acknowledge();
					leave();
				}}
			/>
		);

	return (
		<AuthCard
			icon={<ShieldCheck />}
			title="Protège ton compte"
			lead="Ajoute une application d’authentification : en plus du mot de passe, son code te sera demandé à chaque connexion. Tu peux aussi le faire plus tard, depuis ton profil."
		>
			<TotpSetupForm
				defaultName="Mon application"
				onDone={() => undefined}
				onCancel={leave}
				exitLabel="Passer cette étape"
			/>
		</AuthCard>
	);
}
