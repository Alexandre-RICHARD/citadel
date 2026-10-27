import { ArrowRight, Lock } from "lucide-react";
import type { MouseEvent } from "react";
import { Link } from "react-router";

import { navigateToProject } from "../../../../../../react/appNavigation/projectTransition/navigateToProject";
import type { ShowcaseProject } from "../../../../routing/showcaseProject.type";
import presentationStyles from "../Presentation/presentation.module.scss";
import styles from "./projectPanel.module.scss";

type Props = {
	project: ShowcaseProject;
	reducedMotion: boolean;
};

// La présentation d'un projet : ce qu'il fait, à quoi il sert, et le bouton qui y mène
export function ProjectPanel({ project, reducedMotion }: Props) {
	const { showcase } = project;

	// Un clic simple lance la transition ; ouvrir dans un nouvel onglet reste possible
	function handleOpenClick(event: MouseEvent<HTMLAnchorElement>) {
		if (
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		)
			return;
		event.preventDefault();
		void navigateToProject({
			project,
			originElement: event.currentTarget,
			reducedMotion,
		});
	}

	return (
		<article>
			<div className={styles.head}>
				<div>
					<p
						className={presentationStyles.kicker}
						data-anim
					>
						{showcase.kicker}
					</p>
					<h1
						className={presentationStyles.title}
						data-anim
						data-anim-title
					>
						{project.name}
					</h1>
				</div>
				<img
					className={styles.illustration}
					src={project.illustration}
					alt=""
					data-anim
					data-anim-illustration
				/>
			</div>
			<p
				className={presentationStyles.lead}
				data-anim
			>
				{showcase.lead}
			</p>
			<div className={styles.facts}>
				{showcase.facts.map((fact) => (
					<section
						key={fact.title}
						className={styles.fact}
						data-anim
					>
						<h2>{fact.title}</h2>
						<p>{fact.text}</p>
					</section>
				))}
			</div>
			<div
				className={styles.actions}
				data-anim
			>
				<Link
					to={project.path}
					className={styles.openButton}
					onClick={handleOpenClick}
				>
					Y accéder
					<ArrowRight aria-hidden />
				</Link>
				{/* Factice tant que les comptes n'existent pas */}
				{showcase.requiresAuth && (
					<span className={styles.authBadge}>
						<Lock aria-hidden />
						Connexion requise
					</span>
				)}
			</div>
		</article>
	);
}
