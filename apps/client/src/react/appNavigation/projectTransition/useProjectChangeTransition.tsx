import { usePrefersReducedMotion } from "@citadel/common/src/react/hooks/usePrefersReducedMotion";
import { useEffect, useRef } from "react";
import { NavigationType, useBlocker } from "react-router";

import { findProjectByPathname } from "../findProjectByPathname";
import type { ProjectDictionary } from "../projectDictionary.type";
import { getTransitionOrigin } from "./getTransitionOrigin";
import { navigateToProject } from "./navigateToProject";
import type { TransitionPoint } from "./transitionPoint.type";

type PendingTransition = {
	origin: TransitionPoint;
	// Le projet que l'on quitte : la transition de retour vers la homepage est la sienne
	fromProject: ProjectDictionary | undefined;
};

// Tout changement de projet passe par une transition : liens, boutons de retour, précédent et suivant du navigateur.
// Le routeur retient la navigation pendant que l'écran se couvre, puis la laisse passer. Une navigation retenue
// pendant une transition est abandonnée, comme un second clic
export function useProjectChangeTransition(): void {
	const reducedMotion = usePrefersReducedMotion();
	const pendingRef = useRef<PendingTransition | null>(null);

	const blocker = useBlocker(
		({ currentLocation, nextLocation, historyAction }) => {
			const nextProject = findProjectByPathname(nextLocation.pathname);
			const currentProject = findProjectByPathname(currentLocation.pathname);
			if (!nextProject || nextProject === currentProject) return false;
			pendingRef.current = {
				// Pris tout de suite, pendant que l'élément cliqué a encore le focus
				origin: getTransitionOrigin(historyAction !== NavigationType.Pop),
				fromProject: currentProject,
			};
			return true;
		},
	);

	useEffect(() => {
		if (blocker.state !== "blocked") return;
		const project = findProjectByPathname(blocker.location.pathname);
		if (!project) return;
		void navigateToProject({
			project,
			fromProject: pendingRef.current?.fromProject,
			origin: pendingRef.current?.origin ?? getTransitionOrigin(false),
			reducedMotion,
			navigate: blocker.proceed,
		});
	}, [blocker, reducedMotion]);
}
