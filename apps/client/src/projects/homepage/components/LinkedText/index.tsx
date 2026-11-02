import { ExternalLink } from "lucide-react";

import { externalLinks } from "../../../../common/links/externalLinks";
import { parseLinkedText } from "../../../../common/links/parseLinkedText";
import styles from "./linkedText.module.scss";

type Props = {
	// Du texte avec des liens « [texte](clé) », clé du dictionnaire des liens externes
	text: string;
};

const MAIL_LINK_PREFIX = "mailto:";

// Affiche un texte dont les liens viennent du dictionnaire des liens externes. Une adresse mail ouvre le client mail ;
// un site s'ouvre dans un nouvel onglet, signalé par une icône
export function LinkedText({ text }: Props) {
	return parseLinkedText(text).map((part, index) => {
		// Les morceaux d'un texte fixe ne changent jamais d'ordre
		const partKey = `${index}-${part.text}`;
		if (part.kind === "text") return part.text;

		const href: string = externalLinks[part.key];
		if (href.startsWith(MAIL_LINK_PREFIX))
			return (
				<a
					key={partKey}
					className={styles.link}
					href={href}
				>
					{part.text}
				</a>
			);

		return (
			<a
				key={partKey}
				className={styles.link}
				href={href}
				target="_blank"
				rel="noopener noreferrer"
			>
				{part.text}
				<ExternalLink
					className={styles.icon}
					aria-hidden
				/>
				<span className={styles.hidden}> (s’ouvre dans un nouvel onglet)</span>
			</a>
		);
	});
}
