import { ArrowLeft } from "lucide-react";

import { welcomeContent } from "../../../../content/welcomeContent";
import presentationStyles from "../Presentation/presentation.module.scss";
import styles from "./welcomePanel.module.scss";

// Rien de sélectionné : le site se présente et invite à choisir un projet
export function WelcomePanel() {
	return (
		<article>
			<p
				className={presentationStyles.kicker}
				data-anim
			>
				{welcomeContent.kicker}
			</p>
			<h1
				className={presentationStyles.title}
				data-anim
				data-anim-title
			>
				{welcomeContent.title}
			</h1>
			<p
				className={presentationStyles.lead}
				data-anim
			>
				{welcomeContent.lead}
			</p>
			<p
				className={styles.hint}
				data-anim
			>
				<span className={styles.hintArrow}>
					<ArrowLeft aria-hidden />
				</span>
				{welcomeContent.hint}
			</p>
		</article>
	);
}
