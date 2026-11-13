import { LoginMethodEnum } from "@citadel/specs/src/projects/auth/enum/loginMethod.enum";
import { TriangleAlert } from "lucide-react";

import { useUpdateMe } from "../../../../api/me/useUpdateMe";
import type { MeFm } from "../../../../api/model/meFm.type";
import { FormAlert } from "../../../../components/FormAlert";
import { useAuthFailure } from "../../../../hooks/useAuthFailure";
import { ProfileSubsection } from "../ProfileSubsection";
import styles from "./loginMethodsSection.module.scss";

type Props = {
	me: MeFm;
};

// `warning` : ce que la méthode ferme, sans confirmation ni indice sur la page de connexion
const OPTIONS: {
	value: LoginMethodEnum;
	label: string;
	hint: string;
	warning?: string;
}[] = [
	{
		value: LoginMethodEnum.BOTH,
		label: "Les deux",
		hint: "Par email (lien ou code) ou par pseudo et mot de passe.",
	},
	{
		value: LoginMethodEnum.MAIL,
		label: "Par email",
		hint: "Un lien ou un code reçu par email. Ton mot de passe reste demandé pour les actions sensibles.",
		warning:
			"Tu ne pourras plus te connecter avec ton mot de passe : il sera refusé comme des identifiants incorrects.",
	},
	{
		value: LoginMethodEnum.PASSWORD,
		label: "Par mon pseudo (et mot de passe)",
		hint: "Ton pseudo ou ton adresse email, et ton mot de passe.",
		warning:
			"Tu ne pourras plus te connecter par email : aucun lien ni code ne te sera envoyé, sans message d’erreur.",
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
		<ProfileSubsection
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
				{OPTIONS.map(({ value, label, hint, warning }) => (
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
							{warning !== undefined && (
								<span className={styles.warning}>
									<TriangleAlert aria-hidden />
									{warning}
								</span>
							)}
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
		</ProfileSubsection>
	);
}
