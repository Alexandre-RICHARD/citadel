import { SlidersHorizontal } from "lucide-react";

import { pageTransitionsStore } from "../../../../../../react/appNavigation/projectTransition/pageTransitionsStore";
import { usePageTransitionsDisabled } from "../../../../../../react/appNavigation/projectTransition/usePageTransitionsDisabled";
import { ProfileSection } from "../../../../components/ProfileSection";
import styles from "./preferencesSection.module.scss";

// Les préférences d'affichage, gardées dans ce navigateur (pas dans le compte). Le réglage « réduire les animations »
// du système coupe déjà les transitions : la case force le même comportement
export function PreferencesSection() {
	const isDisabled = usePageTransitionsDisabled();

	return (
		<ProfileSection
			icon={<SlidersHorizontal />}
			title="Affichage"
			lead="Ces choix restent dans ce navigateur."
		>
			<label className={styles.option}>
				<input
					type="checkbox"
					checked={isDisabled}
					onChange={(event) =>
						pageTransitionsStore.setDisabled(event.target.checked)
					}
				/>
				<span>
					Désactiver les animations de navigation
					<span className={styles.hint}>
						Plus de rideau entre les projets, ni de texte qui tombe ou de fondu
						sur la page d’accueil : la navigation est plus rapide. Le décor
						reste animé, sauf si le réglage « réduire les animations » de ton
						système est actif (il coupe tout).
					</span>
				</span>
			</label>
		</ProfileSection>
	);
}
