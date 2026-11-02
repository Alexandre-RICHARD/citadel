import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import { NOREPLY_ADDRESS } from "@citadel/server/src/mail/address/noreplyAddress.ts";
import type { Mail } from "@citadel/server/src/mail/mail.type.ts";
import type { MailAddress } from "@citadel/server/src/mail/mailAddress.type.ts";
import { DARK_SCHEME_MEDIA } from "@citadel/server/src/mail/template/html/darkSchemeMedia.ts";
import { type SyntheticEvent, useState } from "react";

import styles from "./mailPreview.module.scss";

type Props = {
	mail: Mail;
};

type ColorScheme = "light" | "dark";
type Viewport = "desktop" | "phone";

type ToggleOption<Value extends string> = {
	value: Value;
	label: string;
};

type ToggleProps<Value extends string> = {
	label: string;
	options: ToggleOption<Value>[];
	value: Value;
	onChange: (value: Value) => void;
};

const COLOR_SCHEMES: ToggleOption<ColorScheme>[] = [
	{ value: "light", label: "Clair" },
	{ value: "dark", label: "Sombre" },
];

const VIEWPORTS: ToggleOption<Viewport>[] = [
	{ value: "desktop", label: "Bureau" },
	{ value: "phone", label: "Mobile" },
];

// La largeur d'un téléphone courant : le mail passe en disposition étroite sous 620 px
const FRAME_WIDTHS: Record<Viewport, string> = {
	desktop: "100%",
	phone: "390px",
};

function formatAddress({ email, name }: MailAddress): string {
	return name === null ? email : `${name} <${email}>`;
}

function Toggle<Value extends string>({
	label,
	options,
	value,
	onChange,
}: ToggleProps<Value>) {
	return (
		<div
			className={styles.toggle}
			role="group"
			aria-label={label}
		>
			{options.map((option) => (
				<button
					key={option.value}
					type="button"
					className={joinClassNames(
						styles.toggleButton,
						option.value === value && styles.toggleButtonActive,
					)}
					aria-pressed={option.value === value}
					onClick={() => onChange(option.value)}
				>
					{option.label}
				</button>
			))}
		</div>
	);
}

// Un mail comme le reçoit un destinataire : ses en-têtes, son HTML (dans un cadre isolé : aucun script, aucun style
// du site) et sa version en texte brut, que les clients mail affichent quand le HTML est refusé. Le cadre prend la
// largeur d'un téléphone sur demande ; il garde l'origine du Storybook, sans script, pour lire la hauteur du mail et
// s'y ajuster. Le navigateur ne transmet pas de mode sombre à un cadre : ses règles s'appliquent alors sans condition
export function MailPreview({ mail }: Props) {
	const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
	const [viewport, setViewport] = useState<Viewport>("desktop");
	const [frameHeight, setFrameHeight] = useState<number | null>(null);
	const html =
		colorScheme === "dark"
			? mail.html.replace(DARK_SCHEME_MEDIA, "@media all")
			: mail.html;

	function fitFrameToMail(event: SyntheticEvent<HTMLIFrameElement>) {
		const mailHeight =
			event.currentTarget.contentDocument?.documentElement.scrollHeight;
		setFrameHeight(mailHeight ?? null);
	}

	return (
		<div className={styles.preview}>
			<dl className={styles.headers}>
				<dt>De</dt>
				<dd>{formatAddress(NOREPLY_ADDRESS)}</dd>
				<dt>À</dt>
				<dd>{formatAddress(mail.to)}</dd>
				{mail.replyTo !== null && (
					<>
						<dt>Répondre à</dt>
						<dd>{formatAddress(mail.replyTo)}</dd>
					</>
				)}
				<dt>Objet</dt>
				<dd className={styles.subject}>{mail.subject}</dd>
			</dl>
			<div className={styles.panes}>
				<section className={styles.pane}>
					<div className={styles.paneHeader}>
						<h2 className={styles.paneTitle}>HTML</h2>
						<Toggle
							label="Mode"
							options={COLOR_SCHEMES}
							value={colorScheme}
							onChange={setColorScheme}
						/>
						<Toggle
							label="Largeur"
							options={VIEWPORTS}
							value={viewport}
							onChange={setViewport}
						/>
					</div>
					<div
						className={joinClassNames(
							styles.stage,
							colorScheme === "dark" && styles.stageDark,
						)}
					>
						<iframe
							// Un nouveau cadre à chaque réglage : il se recharge, et se remesure
							key={`${colorScheme}-${viewport}`}
							className={styles.frame}
							title="Version HTML du mail"
							sandbox="allow-same-origin"
							srcDoc={html}
							style={{
								width: FRAME_WIDTHS[viewport],
								height: frameHeight ?? undefined,
							}}
							onLoad={fitFrameToMail}
						/>
					</div>
				</section>
				<section className={styles.pane}>
					<div className={styles.paneHeader}>
						<h2 className={styles.paneTitle}>Texte brut</h2>
					</div>
					<pre className={styles.text}>{mail.text}</pre>
				</section>
			</div>
		</div>
	);
}
