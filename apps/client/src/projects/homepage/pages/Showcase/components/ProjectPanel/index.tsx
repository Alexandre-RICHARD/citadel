import { ArrowRight, Lock } from "lucide-react";
import { Link } from "react-router";

import type { ShowcaseProject } from "../../../../routing/showcaseProject.type";
import presentationStyles from "../Presentation/presentation.module.scss";
import styles from "./projectPanel.module.scss";

type Props = {
	project: ShowcaseProject;
};

// La présentation d'un projet : ce qu'il fait, à quoi il sert, et le bouton qui y mène
export function ProjectPanel({ project }: Props) {
	const { showcase } = project;

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
				{/* La transition vers le projet part de là : AppContainer la lance à chaque changement de projet */}
				<Link
					to={project.path}
					className={styles.openButton}
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
