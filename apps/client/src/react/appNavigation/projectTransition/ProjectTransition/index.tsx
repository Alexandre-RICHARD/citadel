import { themeToCssVariables } from "@citadel/design-system/src/theme/themeToCssVariables";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { createTransitionCanvas } from "../createTransitionCanvas";
import { projectTransitionStore } from "../projectTransitionStore";
import type { TransitionTip } from "../transitionTip.type";
import styles from "./projectTransition.module.scss";

const TIP_IN_MS = 450;
const TIP_OUT_MS = 250;

// Le rideau des transitions entre projets, et l'astuce quand le chargement traîne. Monté une fois, hors du
// routeur : il reste affiché pendant que la page change dessous
export function ProjectTransition() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const tipRef = useRef<HTMLDivElement>(null);
	const [tip, setTip] = useState<TransitionTip | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const tipElement = tipRef.current;
		if (!canvas || !tipElement) return undefined;

		const transitionCanvas = createTransitionCanvas(canvas);
		const unregister = projectTransitionStore.register({
			cover: transitionCanvas.cover,
			reveal: transitionCanvas.reveal,
			showTip: setTip,
			async hideTip() {
				await tipElement.animate(
					[
						{ opacity: 1, transform: "translate(-50%, -50%)" },
						{ opacity: 0, transform: "translate(-50%, calc(-50% - 0.8rem))" },
					],
					{ duration: TIP_OUT_MS, easing: "ease-in", fill: "forwards" },
				).finished;
				setTip(null);
			},
		});

		return () => {
			unregister();
			transitionCanvas.destroy();
		};
	}, []);

	// L'astuce monte en fondu dès qu'elle est posée
	useLayoutEffect(() => {
		if (!tip) return;
		tipRef.current?.animate(
			[
				{ opacity: 0, transform: "translate(-50%, calc(-50% + 1.2rem))" },
				{ opacity: 1, transform: "translate(-50%, -50%)" },
			],
			{ duration: TIP_IN_MS, easing: "ease-out", fill: "forwards" },
		);
	}, [tip]);

	return (
		<>
			<canvas
				ref={canvasRef}
				className={styles.canvas}
				hidden
				aria-hidden
			/>
			<div
				ref={tipRef}
				className={styles.tip}
				// Les couleurs et les polices du projet qui se charge
				style={tip ? themeToCssVariables(tip.theme) : undefined}
				aria-live="polite"
			>
				{tip && (
					<>
						<small className={styles.tipLabel}>Chargement</small>
						<strong className={styles.tipTitle}>{tip.title}</strong>
						<p className={styles.tipText}>
							<b>Astuce :</b> {tip.text}
						</p>
					</>
				)}
			</div>
		</>
	);
}
