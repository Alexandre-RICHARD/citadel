import { LoginMethodEnum } from "@citadel/specs/src/projects/auth/enum/loginMethod.enum";
import { LogIn } from "lucide-react";

import { useUpdateMe } from "../../../../api/me/useUpdateMe";
import type { MeFm } from "../../../../api/model/meFm.type";
import { FormAlert } from "../../../../components/FormAlert";
import { ProfileSection } from "../../../../components/ProfileSection";
import { useAuthFailure } from "../../../../hooks/useAuthFailure";
import styles from "./loginMethodsSection.module.scss";

type Props = {
	me: MeFm;
};

const OPTIONS: { value: LoginMethodEnum; label: string; hint: string }[] = [
	{
		value: LoginMethodEnum.BOTH,
		label: "Les deux",
		hint: "Par email (lien ou code) ou par pseudo et mot de passe.",
	},
	{
		value: LoginMethodEnum.MAIL,
		label: "Par email",
		hint: "Un lien ou un code reçu par email. Ton mot de passe reste demandé pour les actions sensibles.",
	},
	{
		value: LoginMethodEnum.PASSWORD,
		label: "Par mon pseudo (et mot de passe)",
		hint: "Ton pseudo ou ton adresse email, et ton mot de passe.",
	},
];

// Comment tu préfères te connecter. « Mot de passe oublié » reste toujours ouvert, quelle que soit la méthode choisie
export function LoginMethodsSection({ me }: Props) {
	const updateMe = useUpdateMe();
	const { failure, report, clear } = useAuthFailure(
		"changer ta méthode de connexion",
	);

	function choose(loginMethods: LoginMethodEnum): void {
		if (loginMethods === me.loginMethods) return;
		clear();
		updateMe.mutate(
			{ loginMethods },
			{
				onError: (error) => {
					report(error, () => choose(loginMethods));
				},
			},
		);
	}

	return (
		<ProfileSection
			icon={<LogIn />}
			title="Méthodes de connexion"
			lead="Je préfère pouvoir me connecter :"
		>
			<fieldset
				className={styles.options}
				disabled={updateMe.isPending}
			>
				<legend className={styles.legend}>
					Méthodes de connexion acceptées
				</legend>
				{OPTIONS.map(({ value, label, hint }) => (
					<div
						key={value}
						className={styles.option}
					>
						<input
							id={`login-methods-${value}`}
							type="radio"
							name="login-methods"
							checked={me.loginMethods === value}
							onChange={() => choose(value)}
						/>
						<label htmlFor={`login-methods-${value}`}>
							{label}
							<span className={styles.hint}>{hint}</span>
						</label>
					</div>
				))}
			</fieldset>
			{failure !== null && (
				<FormAlert
					tone="error"
					onRetry={failure.retry}
				>
					{failure.message}
				</FormAlert>
			)}
		</ProfileSection>
	);
}
