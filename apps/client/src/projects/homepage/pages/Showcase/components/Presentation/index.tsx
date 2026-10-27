import type { ShowcaseProject } from "../../../../routing/showcaseProject.type";
import { PresentationPanel } from "../PresentationPanel";
import { ProjectPanel } from "../ProjectPanel";
import { WelcomePanel } from "../WelcomePanel";
import styles from "./presentation.module.scss";
import { usePanelSequence } from "./usePanelSequence";

type Props = {
	selectedProject: ShowcaseProject | null;
	isPaused: boolean;
	reducedMotion: boolean;
};

// La zone de présentation : le texte d'accueil, ou le projet sélectionné
export function Presentation({
	selectedProject,
	isPaused,
	reducedMotion,
}: Props) {
	const { panels, markEntered, removePanel } = usePanelSequence(
		selectedProject,
		reducedMotion,
	);

	return (
		<section
			className={styles.presentation}
			aria-live="polite"
			data-reveal="present"
		>
			{/* Un voile doux derrière le texte, pour le lire par-dessus les blobs */}
			<div
				className={styles.scrim}
				aria-hidden
			/>
			<div className={styles.panels}>
				{panels.map((panel) => (
					<PresentationPanel
						key={panel.id}
						panel={panel}
						isPaused={isPaused}
						reducedMotion={reducedMotion}
						onEntered={markEntered}
						onGhostDone={removePanel}
					>
						{panel.project ? (
							<ProjectPanel
								project={panel.project}
								reducedMotion={reducedMotion}
							/>
						) : (
							<WelcomePanel />
						)}
					</PresentationPanel>
				))}
			</div>
		</section>
	);
}
