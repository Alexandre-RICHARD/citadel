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
					Désactiver les transitions entre les pages
					<span className={styles.hint}>
						Les autres animations restent. Le réglage « réduire les animations »
						de ton système les coupe déjà.
					</span>
				</span>
			</label>
		</ProfileSection>
	);
}
