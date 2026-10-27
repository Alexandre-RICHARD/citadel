import { type ReactNode, useEffect } from "react";

import { projectTransitionStore } from "../appNavigation/projectTransition/projectTransitionStore";
import { useAppNavigation } from "../appNavigation/useAppNavigation";

type Props = {
	children: ReactNode;
};

export function AppContainer({ children }: Props) {
	useAppNavigation();

	// La page du projet est affichée : une transition en cours peut découvrir l'écran
	useEffect(() => {
		projectTransitionStore.notifyPageReady();
	}, []);

	return children;
}
