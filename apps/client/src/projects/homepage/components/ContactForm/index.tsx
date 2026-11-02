import { useNow } from "@citadel/common/src/react/hooks/useNow";
import { RequiredMark } from "@citadel/design-system/src/atoms/RequiredMark";
import { ContactFieldMaxLengthEnum } from "@citadel/specs/src/projects/contact/contactFieldMaxLength.enum";
import { sendContactMessageBodySchema } from "@citadel/specs/src/projects/contact/endpoint/messages/sendContactMessage/sendContactMessageBodySchema";
import { Mail, Send } from "lucide-react";
import { type FormEvent, useId, useState } from "react";

import { useIsContactOpen } from "../../../../common/api/mail/useIsContactOpen";
import { checkInput } from "../../../../common/validation/checkInput";
import { contactFieldLabels } from "../../api/contact/contactFieldLabels";
import { useSendContactMessage } from "../../api/contact/useSendContactMessage";
import { CONTACT_MAIL_LINK } from "../../content/contactMailLink";
import { formatWaitDelay } from "../../helper/formatWaitDelay";
import { resolveContactFailure } from "../../helper/resolveContactFailure";
import { ContactSuccess } from "../ContactSuccess";
import { LinkedText } from "../LinkedText";
import styles from "./contactForm.module.scss";

type ContactFields = {
	subject: string;
	message: string;
	email: string;
	name: string;
	// Le champ piège : toujours vide pour un humain
	website: string;
};

const EMPTY_FIELDS: ContactFields = {
	subject: "",
	message: "",
	email: "",
	name: "",
	website: "",
};
const COUNTDOWN_REFRESH_MS = 1000;

// Le formulaire de la page Contact. Un échec garde le texte saisi ; une 429 bloque le bouton le temps annoncé par le
// serveur ; fermé par le quota de mails, il reste visible mais désactivé, avec l'adresse pour écrire directement
export function ContactForm() {
	const fieldId = useId();
	const isContactOpen = useIsContactOpen();
	const { mutate, isPending } = useSendContactMessage();
	const [fields, setFields] = useState(EMPTY_FIELDS);
	const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
	const [failureMessage, setFailureMessage] = useState<string | null>(null);
	const [retryAt, setRetryAt] = useState<number | null>(null);
	// undefined : pas encore envoyé ; sinon l'adresse donnée (null : aucune)
	const [sentEmail, setSentEmail] = useState<string | null | undefined>();
	const now = useNow(retryAt === null ? null : COUNTDOWN_REFRESH_MS);

	const check = checkInput(
		sendContactMessageBodySchema,
		fields,
		contactFieldLabels,
	);
	const waitMs = retryAt === null ? 0 : retryAt - now;
	const isWaiting = waitMs > 0;

	function updateField(field: keyof ContactFields, value: string) {
		setFields((current) => ({ ...current, [field]: value }));
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setHasTriedSubmit(true);
		if (!check.isValid || isWaiting || isPending || !isContactOpen) return;

		setFailureMessage(null);
		const body = check.data;
		mutate(body, {
			onSuccess: () => {
				setSentEmail(body.email);
				setFields(EMPTY_FIELDS);
				setHasTriedSubmit(false);
			},
			onError: (error) => {
				const failure = resolveContactFailure(error, Date.now());
				if (failure.kind === "wait") setRetryAt(failure.retryAt);
				else setFailureMessage(failure.message);
			},
		});
	}

	if (sentEmail !== undefined)
		return (
			<ContactSuccess
				email={sentEmail}
				onWriteAgain={() => setSentEmail(undefined)}
			/>
		);

	const submitLabel = isPending
		? "Envoi…"
		: isWaiting
			? `Patientez ${formatWaitDelay(waitMs)}`
			: "Envoyer";

	return (
		<form
			className={styles.form}
			onSubmit={handleSubmit}
			noValidate
		>
			<span
				className={styles.badge}
				aria-hidden
			>
				<Mail />
			</span>
			{!isContactOpen && (
				<p
					className={styles.closedNotice}
					role="status"
				>
					Le formulaire est fermé pour aujourd’hui : le site a atteint son quota
					quotidien de mails. Il rouvre demain ; en attendant, écrivez
					directement à l’adresse ci-dessous.
				</p>
			)}
			<fieldset
				className={styles.fieldset}
				disabled={!isContactOpen}
			>
				<legend className={styles.legend}>Votre message</legend>
				<div className={styles.row}>
					<label
						className={styles.field}
						htmlFor={`${fieldId}-name`}
					>
						<span className={styles.label}>
							Nom <span className={styles.optional}>facultatif</span>
						</span>
						<input
							id={`${fieldId}-name`}
							className={styles.input}
							type="text"
							autoComplete="name"
							maxLength={ContactFieldMaxLengthEnum.NAME}
							value={fields.name}
							onChange={(event) => updateField("name", event.target.value)}
						/>
					</label>
					<label
						className={styles.field}
						htmlFor={`${fieldId}-email`}
					>
						<span className={styles.label}>
							Adresse mail{" "}
							<span className={styles.optional}>pour vous répondre</span>
						</span>
						<input
							id={`${fieldId}-email`}
							className={styles.input}
							type="email"
							autoComplete="email"
							maxLength={ContactFieldMaxLengthEnum.EMAIL}
							value={fields.email}
							onChange={(event) => updateField("email", event.target.value)}
						/>
					</label>
				</div>
				<label
					className={styles.field}
					htmlFor={`${fieldId}-subject`}
				>
					<span className={styles.label}>
						Sujet
						<RequiredMark />
					</span>
					<input
						id={`${fieldId}-subject`}
						className={styles.input}
						type="text"
						required
						maxLength={ContactFieldMaxLengthEnum.SUBJECT}
						value={fields.subject}
						onChange={(event) => updateField("subject", event.target.value)}
					/>
				</label>
				<label
					className={styles.field}
					htmlFor={`${fieldId}-message`}
				>
					<span className={styles.label}>
						Message
						<RequiredMark />
						<span
							className={styles.counter}
							aria-hidden
						>
							{fields.message.length} / {ContactFieldMaxLengthEnum.MESSAGE}
						</span>
					</span>
					<textarea
						id={`${fieldId}-message`}
						className={`${styles.input} ${styles.textarea}`}
						required
						maxLength={ContactFieldMaxLengthEnum.MESSAGE}
						value={fields.message}
						onChange={(event) => updateField("message", event.target.value)}
					/>
				</label>
				{/* Hors de l'écran et du parcours au clavier : seul un robot le remplit */}
				<div
					className={styles.trap}
					aria-hidden
				>
					<label htmlFor={`${fieldId}-website`}>Site web (laisser vide)</label>
					<input
						id={`${fieldId}-website`}
						type="text"
						name="website"
						tabIndex={-1}
						autoComplete="off"
						value={fields.website}
						onChange={(event) => updateField("website", event.target.value)}
					/>
				</div>
				<div className={styles.actions}>
					<button
						type="submit"
						className={styles.submit}
						disabled={isPending || isWaiting}
					>
						<span data-reskin>{submitLabel}</span>
						<Send aria-hidden />
					</button>
					<div
						className={styles.feedback}
						aria-live="polite"
					>
						{isWaiting && (
							<p>
								Trop de messages envoyés depuis votre connexion : vous pourrez
								réessayer dans {formatWaitDelay(waitMs)}.
							</p>
						)}
						{failureMessage !== null && (
							<p
								className={styles.error}
								role="alert"
							>
								{failureMessage}
							</p>
						)}
						{hasTriedSubmit && !check.isValid && (
							<p className={styles.error}>{check.message}</p>
						)}
					</div>
				</div>
			</fieldset>
			<p className={styles.direct}>
				<LinkedText
					text={`Vous pouvez aussi écrire directement à ${CONTACT_MAIL_LINK}.`}
				/>
			</p>
		</form>
	);
}
