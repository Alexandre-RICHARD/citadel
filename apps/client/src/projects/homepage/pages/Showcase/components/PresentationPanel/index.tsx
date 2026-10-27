import { gsap } from "gsap";
import { type ReactNode, useEffect, useLayoutEffect, useRef } from "react";

import { enterCascade } from "../../../../effects/panels/enterCascade";
import { ghostOut } from "../../../../effects/panels/ghostOut";
import type { PresentationPanelState } from "../Presentation/presentationPanelState.type";
import styles from "./presentationPanel.module.scss";

type Props = {
	panel: PresentationPanelState;
	// L'intro joue encore : le panneau attend pour entrer
	isPaused: boolean;
	reducedMotion: boolean;
	onEntered: (id: number) => void;
	onGhostDone: (id: number) => void;
	children: ReactNode;
};

// Un panneau de la présentation, qui joue son entrée en cascade puis, le moment venu, sa sortie fantôme.
// Ses blocs animés sont marqués data-anim
export function PresentationPanel({
	panel,
	isPaused,
	reducedMotion,
	onEntered,
	onGhostDone,
	children,
}: Props) {
	const panelRef = useRef<HTMLDivElement>(null);
	const { id, isGhost, isFastGhost, hasEntered, enterDelay } = panel;

	// Invisible jusqu'à son entrée, dès la première image
	useLayoutEffect(() => {
		const element = panelRef.current;
		if (!element) return undefined;
		const blocks = element.querySelectorAll("[data-anim]");
		gsap.set(blocks, { opacity: 0 });
		return () => {
			gsap.killTweensOf(blocks);
		};
	}, []);

	useEffect(() => {
		const element = panelRef.current;
		if (!element || isGhost || hasEntered || isPaused) return undefined;
		const pendingEntry = gsap.delayedCall(enterDelay, () => {
			onEntered(id);
			enterCascade(element, reducedMotion);
		});
		return () => {
			pendingEntry.kill();
		};
	}, [id, isGhost, hasEntered, isPaused, enterDelay, reducedMotion, onEntered]);

	useEffect(() => {
		const element = panelRef.current;
		if (!element || !isGhost) return undefined;
		const exit = ghostOut(element, { isFast: isFastGhost, reducedMotion });
		exit.eventCallback("onComplete", () => onGhostDone(id));
		return () => {
			exit.kill();
		};
	}, [id, isGhost, isFastGhost, reducedMotion, onGhostDone]);

	return (
		<div
			ref={panelRef}
			className={styles.panel}
			aria-hidden={isGhost}
			inert={isGhost}
		>
			{children}
		</div>
	);
}
