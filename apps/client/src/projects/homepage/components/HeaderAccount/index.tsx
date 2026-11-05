import { ConfirmDialog } from "@citadel/design-system/src/molecules/ConfirmDialog";
import { LogOut, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router";

import { SignInStateEnum } from "../../../auth/api/me/signInState.enum";
import { useMe } from "../../../auth/api/me/useMe";
import { useSignInState } from "../../../auth/api/me/useSignInState";
import { useLogoutWithWarning } from "../../../auth/hooks/useLogoutWithWarning";
import { AuthPathEnum } from "../../../auth/routing/authPath.enum";
import { buildLoginPath } from "../../../auth/routing/buildLoginPath";
import styles from "./headerAccount.module.scss";

// Le compte dans le header : « Se connecter », ou le pseudo affiché (vers le profil) et « Se déconnecter ». Rien tant
// que GET /auth/me n'a pas répondu, pour ne pas montrer « Se connecter » à un compte connecté
export function HeaderAccount() {
	const { pathname, search, hash } = useLocation();
	const signInState = useSignInState();
	const me = useMe();
	const { requestLogout, isWarning, confirmLogout, cancelLogout, isPending } =
		useLogoutWithWarning();

	if (signInState === SignInStateEnum.PENDING) return null;

	if (me === null || me === undefined)
		return (
			<Link
				to={buildLoginPath(`${pathname}${search}${hash}`)}
				className={styles.loginButton}
			>
				<span data-reskin>Se connecter</span>
			</Link>
		);

	return (
		<>
			<Link
				to={AuthPathEnum.PROFILE}
				className={styles.profileLink}
				// Sur téléphone, le pseudo affiché disparaît : le nom du lien reste
				aria-label={`Mon profil, ${me.displayName}`}
				title="Mon profil"
			>
				<UserRound aria-hidden />
				<span
					className={styles.displayName}
					data-reskin
				>
					{me.displayName}
				</span>
			</Link>
			<button
				type="button"
				className={styles.logoutButton}
				onClick={requestLogout}
				disabled={isPending}
				aria-label="Se déconnecter"
				title="Se déconnecter"
			>
				<LogOut aria-hidden />
				<span
					className={styles.logoutLabel}
					data-reskin
				>
					Se déconnecter
				</span>
			</button>
			<ConfirmDialog
				open={isWarning}
				title="Se déconnecter maintenant ?"
				description="Des modifications sont encore en cours d’envoi. Si l’une échoue, vous ne le saurez pas."
				confirmLabel="Se déconnecter"
				onConfirm={confirmLogout}
				onCancel={cancelLogout}
			/>
		</>
	);
}
