import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

import type { FooterPage as FooterPageContent } from "../../content/footerPage.type";
import styles from "./footerPage.module.scss";

type Props = {
	page: FooterPageContent;
	// La présentation d'où l'on venait
	backPath: string;
};

// Une page du footer, dans le conteneur principal : À propos, Mentions légales, Données personnelles.
// Échap la ferme aussi (Layout)
export function FooterPage({ page, backPath }: Props) {
	return (
		<article className={styles.page}>
			<Link
				to={backPath}
				className={styles.back}
			>
				<ArrowLeft aria-hidden />
				Projets
			</Link>
			<h1 className={styles.title}>{page.title}</h1>
			<p className={styles.intro}>{page.intro}</p>
			{page.sections.map((section) => (
				<section key={section.title}>
					<h2 className={styles.sectionTitle}>{section.title}</h2>
					{section.paragraphs.map((paragraph) => (
						<p
							key={paragraph}
							className={styles.paragraph}
						>
							{paragraph}
						</p>
					))}
				</section>
			))}
		</article>
	);
}
