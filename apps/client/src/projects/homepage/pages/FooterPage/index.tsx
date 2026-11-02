import { ArrowLeft, X } from "lucide-react";
import { Link } from "react-router";

import { ContactForm } from "../../components/ContactForm";
import type { FooterPage as FooterPageContent } from "../../content/footerPage.type";
import styles from "./footerPage.module.scss";

type Props = {
	page: FooterPageContent;
	// La présentation d'où l'on venait
	backPath: string;
};

// Une page du footer, dans le conteneur principal : À propos, Contact, Mentions légales, Données personnelles.
// Trop longue pour l'écran, elle défile à l'intérieur de son cadre, dont la barre du haut reste visible : le retour
// aux projets et la croix de fermeture. Échap la ferme aussi (Layout), sauf pendant une saisie
export function FooterPage({ page, backPath }: Props) {
	return (
		<article className={styles.page}>
			<div className={styles.bar}>
				<Link
					to={backPath}
					className={styles.back}
				>
					<ArrowLeft aria-hidden />
					Projets
				</Link>
				<Link
					to={backPath}
					className={styles.close}
					aria-label="Fermer la page"
					title="Fermer (Échap)"
				>
					<X aria-hidden />
				</Link>
			</div>
			<div className={styles.content}>
				<h1 className={styles.title}>{page.title}</h1>
				<p className={styles.intro}>
					{page.intro}
				</p>
				{page.kind === "contact" ? (
					<ContactForm />
				) : (
					page.sections.map((section) => (
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
					))
				)}
			</div>
		</article>
	);
}
