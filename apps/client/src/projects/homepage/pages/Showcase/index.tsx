import { useNavigate } from "react-router";

import { buildHomepagePath } from "../../routing/buildHomepagePath";
import { getProjectSlug } from "../../routing/getProjectSlug";
import type { ShowcaseProject } from "../../routing/showcaseProject.type";
import { showcaseProjects } from "../../routing/showcaseProjects";
import { Presentation } from "./components/Presentation";
import { ProjectWheel } from "./components/ProjectWheel";
import { WheelOrientationEnum } from "./components/ProjectWheel/wheelOrientation.enum";
import styles from "./showcase.module.scss";

type Props = {
	selectedProject: ShowcaseProject | null;
	isNarrow: boolean;
	// L'intro est finie : la présentation peut entrer
	isRevealed: boolean;
	reducedMotion: boolean;
};

// La vitrine : la roue des projets à gauche (en haut sur téléphone), la présentation à côté.
// La sélection est dans l'adresse : le retour du navigateur ramène à la présentation précédente
export function Showcase({
	selectedProject,
	isNarrow,
	isRevealed,
	reducedMotion,
}: Props) {
	const navigate = useNavigate();

	return (
		<div className={styles.showcase}>
			<ProjectWheel
				projects={showcaseProjects}
				selectedProject={selectedProject}
				orientation={
					isNarrow
						? WheelOrientationEnum.Horizontal
						: WheelOrientationEnum.Vertical
				}
				reducedMotion={reducedMotion}
				onSelect={(project) => {
					void navigate(buildHomepagePath(getProjectSlug(project)));
				}}
				onClear={() => {
					void navigate(buildHomepagePath());
				}}
			/>
			<Presentation
				selectedProject={selectedProject}
				isPaused={!isRevealed}
				reducedMotion={reducedMotion}
			/>
		</div>
	);
}
