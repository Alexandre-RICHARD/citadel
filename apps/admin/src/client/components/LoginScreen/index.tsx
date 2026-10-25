import { Castle } from "lucide-react";
import { type FormEvent, useState } from "react";

import { apiRequest } from "../../api/apiRequest";
import styles from "./loginScreen.module.scss";

type Props = {
	onLoggedIn: () => void;
};

// Le formulaire ne protège rien à lui seul : c'est le serveur qui vérifie le mot de passe
// et exige ensuite le cookie de session à chaque appel (§14.4)
export function LoginScreen({ onLoggedIn }: Props) {
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSubmitting(true);
		setError(null);
		try {
			await apiRequest("/login", { method: "POST", body: { password } });
			onLoggedIn();
		} catch (loginError) {
			setError(
				loginError instanceof Error ? loginError.message : String(loginError),
			);
			setPassword("");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<main className={styles.loginScreen}>
			<form
				className={styles.form}
				onSubmit={(event) => {
					void submit(event);
				}}
			>
				<span className={styles.logo}>
					<Castle
						size={24}
						strokeWidth={2.25}
					/>
				</span>
				<h1 className={styles.title}>Citadel</h1>
				<p className={styles.subtitle}>{"Console d'administration"}</p>
				<label className={styles.field}>
					<span className={styles.label}>Mot de passe</span>
					<input
						className={styles.input}
						type="password"
						autoComplete="current-password"
						required
						// eslint-disable-next-line jsx-a11y/no-autofocus -- seul champ de la page
						autoFocus
						value={password}
						onChange={(event) => setPassword(event.target.value)}
					/>
				</label>
				{error ? (
					<p
						className={styles.error}
						role="alert"
					>
						{error}
					</p>
				) : null}
				<button
					type="submit"
					className={styles.submit}
					disabled={submitting || password.length === 0}
				>
					{submitting ? "Connexion…" : "Se connecter"}
				</button>
			</form>
		</main>
	);
}
