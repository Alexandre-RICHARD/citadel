import { type ReactNode, useEffect } from "react";

import { projectTransitionStore } from "../appNavigation/projectTransition/projectTransitionStore";
import { useProjectChangeTransition } from "../appNavigation/projectTransition/useProjectChangeTransition";
import { useAppNavigation } from "../appNavigation/useAppNavigation";

type Props = {
	children: ReactNode;
};

export function AppContainer({ children }: Props) {
	useAppNavigation();
	// Quitter ce projet pour un autre lance la transition
	useProjectChangeTransition();

	// La page du projet est affichée : une transition en cours peut découvrir l'écran
	useEffect(() => {
		projectTransitionStore.notifyPageReady();
	}, []);

	return children;
}
