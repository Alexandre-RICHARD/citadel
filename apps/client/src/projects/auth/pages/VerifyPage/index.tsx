import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum";
import { usernameSchema } from "@citadel/specs/src/projects/auth/schema/usernameSchema";
import { Link2, MousePointerClick } from "lucide-react";
import { type FormEvent, useEffect, useId, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { checkInput } from "../../../../common/validation/checkInput";
import { authFieldLabels } from "../../api/authFieldLabels";
import { useFlow } from "../../api/flow/useFlow";
import { useSubmitFlowLink } from "../../api/flow/useSubmitFlowLink";
import { AuthCard } from "../../components/AuthCard";
import { FormAlert } from "../../components/FormAlert";
import { FormField } from "../../components/FormField";
import { SubmitButton } from "../../components/SubmitButton";
import { TextField } from "../../components/TextField";
import { readLinkToken } from "../../helper/readLinkToken";
import { useAuthFailure } from "../../hooks/useAuthFailure";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import { AuthPathEnum } from "../../routing/authPath.enum";
import { findCompletionPath } from "../../routing/findCompletionPath";
import { findFlowPagePath } from "../../routing/findFlowPagePath";
import styles from "./verifyPage.module.scss";

/**
 * Où mène le lien des mails. Rien ne se valide à l'ouverture (les antivirus de messagerie ouvrent les liens pour les
 * analyser) : un clic confirme. Le jeton, dans le fragment de l'adresse, en est retiré dès la lecture. Validé, le
 * parcours se termine (la session s'ouvre) ou continue sur sa page
 */
export function VerifyPage() {
	const fieldId = useId();
	const navigate = useNavigate();
	const { hash, pathname, search } = useLocation();
	const redirectPath = useAuthRedirect();
	const [linkToken, setLinkToken] = useState(() => readLinkToken(hash));
	// null tant que le pseudo choisi à l'inscription n'a pas été pris entre-temps
	const [replacingUsername, setReplacingUsername] = useState<string | null>(
		null,
	);
	const submitLink = useSubmitFlowLink();
	// Le parcours que ce lien termine : sa page de suite en dépend
	const { flow: pendingFlow } = useFlow();
	const { waitUntil, failure, report, clear } =
		useAuthFailure("confirmer ce lien");

	// Un autre lien ouvert dans le même onglet ne change que le fragment : il remplace le précédent
	const [readHash, setReadHash] = useState(hash);
	if (hash !== "" && hash !== readHash) {
		setReadHash(hash);
		setLinkToken(readLinkToken(hash));
		clear();
	}

	// Le jeton ne reste ni dans la barre d'adresse, ni dans l'historique
	useEffect(() => {
		if (hash !== "") void navigate({ pathname, search }, { replace: true });
	}, [hash, pathname, search, navigate]);

	const usernameCheck =
		replacingUsername === null
			? null
			: checkInput(usernameSchema, replacingUsername, authFieldLabels);
	const isRefused =
		failure?.code === AuthErrorCodeEnum.LINK_OTHER_BROWSER ||
		failure?.code === AuthErrorCodeEnum.FLOW_EXPIRED;

	function confirm(): void {
		if (linkToken === null || usernameCheck?.isValid === false) return;
		clear();
		const pendingKind = pendingFlow?.kind;
		submitLink.mutate(
			{
				token: linkToken,
				...(usernameCheck?.isValid === true && {
					username: usernameCheck.data,
				}),
			},
			{
				onSuccess: ({ flow }) => {
					void navigate(
						flow === null
							? findCompletionPath(pendingKind, redirectPath)
							: findFlowPagePath(flow.kind),
						{ replace: true },
					);
				},
				onError: (error) => {
					if (report(error, confirm) === AuthErrorCodeEnum.USERNAME_TAKEN)
						setReplacingUsername((current) => current ?? "");
				},
			},
		);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		confirm();
	}

	if (linkToken === null)
		return (
			<AuthCard
				icon={<Link2 />}
				title="Lien incomplet"
				lead="Ce lien est abîmé : ta messagerie l’a peut-être coupé en deux."
			>
				<FormAlert tone="info">
					Saisis plutôt le code de l’email sur la page restée ouverte, ou
					demande un nouvel email.
				</FormAlert>
			</AuthCard>
		);

	return (
		<AuthCard
			icon={<MousePointerClick />}
			title="Un clic pour confirmer"
			lead="Confirme que c’est bien toi qui as ouvert ce lien."
			footer={
				isRefused ? (
					<>
						<Link to={AuthPathEnum.LOGIN}>Se connecter</Link>
						<Link to={AuthPathEnum.REGISTER}>Créer un compte</Link>
					</>
				) : undefined
			}
		>
			<form
				className={styles.form}
				onSubmit={handleSubmit}
				noValidate
			>
				{replacingUsername !== null && (
					<FormField
						label="Nouveau pseudo"
						htmlFor={`${fieldId}-username`}
						isRequired
					>
						<TextField
							id={`${fieldId}-username`}
							value={replacingUsername}
							onChange={setReplacingUsername}
							autoComplete="username"
							isRequired
							isInvalid={usernameCheck?.isValid === false}
						/>
						<p className={styles.hint}>
							Le pseudo choisi a été pris entre-temps : choisis-en un autre, ton
							lien reste valable.
						</p>
					</FormField>
				)}
				{failure?.code === AuthErrorCodeEnum.LINK_OTHER_BROWSER && (
					<FormAlert tone="error">
						<p>
							Ce lien a été ouvert dans un autre navigateur que celui où tu as
							commencé.
						</p>
						<p>
							Ouvre-le dans ce navigateur-là, ou saisis le code de l’email sur
							la page restée ouverte : il marche sur tous les appareils.
						</p>
					</FormAlert>
				)}
				{failure?.code === AuthErrorCodeEnum.FLOW_EXPIRED && (
					<FormAlert tone="error">
						Ce lien n’est plus valable : déjà utilisé, remplacé par un email
						plus récent, ou expiré. Recommence depuis la page de départ.
					</FormAlert>
				)}
				{failure !== null && !isRefused && (
					<FormAlert
						tone="error"
						onRetry={failure.retry}
					>
						{failure.message}
					</FormAlert>
				)}
				{!isRefused && (
					<SubmitButton
						label="Confirmer"
						pendingLabel="Confirmation…"
						icon={<MousePointerClick aria-hidden />}
						isPending={submitLink.isPending}
						waitUntil={waitUntil}
						isDisabled={usernameCheck?.isValid === false}
					/>
				)}
			</form>
		</AuthCard>
	);
}
