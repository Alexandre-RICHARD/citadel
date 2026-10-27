import type { ThemeType } from "@citadel/design-system/src/theme/theme.type";
import { useEffect, useMemo, useRef } from "react";

import type { BackgroundEffectEnum } from "../../../../react/appNavigation/showcase/backgroundEffect.enum";
import { createBackgroundEffects } from "../../effects/backgroundEffects/createBackgroundEffects";
import { createLavaLamp } from "../../effects/lavaLamp/createLavaLamp";
import styles from "./background.module.scss";

type Props = {
	// Le thème de l'ambiance : les blobs prennent ses couleurs de décoration
	theme: ThemeType;
	effect: BackgroundEffectEnum | null;
	isDark: boolean;
	// Temps que mettent les blobs à changer de couleur, comme le reste de l'ambiance
	durationSeconds: number;
	reducedMotion: boolean;
	isNarrow: boolean;
};

type LavaLamp = NonNullable<ReturnType<typeof createLavaLamp>>;
type BackgroundEffects = ReturnType<typeof createBackgroundEffects>;

// Le fond animé de toute la page, en calques : le fond du projet (derrière), la lampe à lave (ou ses halos en CSS
// sans WebGL), puis les braises de Game Death Counter, les seules qui passent devant les blobs
export function Background({
	theme,
	effect,
	isDark,
	durationSeconds,
	reducedMotion,
	isNarrow,
}: Props) {
	const rootRef = useRef<HTMLDivElement>(null);
	const backCanvasRef = useRef<HTMLCanvasElement>(null);
	const lavaCanvasRef = useRef<HTMLCanvasElement>(null);
	const frontCanvasRef = useRef<HTMLCanvasElement>(null);
	const lavaLampRef = useRef<LavaLamp | null>(null);
	const effectsRef = useRef<BackgroundEffects | null>(null);

	const decorations = useMemo(
		() => [
			theme.colorDecoration1,
			theme.colorDecoration2,
			theme.colorDecoration3,
			theme.colorDecoration4,
		],
		[
			theme.colorDecoration1,
			theme.colorDecoration2,
			theme.colorDecoration3,
			theme.colorDecoration4,
		],
	);
	const effectPalette = useMemo(
		() => ({ text: theme.colorText, accent: theme.colorPrimaryHue, isDark }),
		[theme.colorText, theme.colorPrimaryHue, isDark],
	);

	useEffect(() => {
		const root = rootRef.current;
		const backCanvas = backCanvasRef.current;
		const lavaCanvas = lavaCanvasRef.current;
		const frontCanvas = frontCanvasRef.current;
		if (!root || !backCanvas || !lavaCanvas || !frontCanvas) return undefined;

		const lavaLamp = createLavaLamp(lavaCanvas);
		const backgroundEffects = createBackgroundEffects(backCanvas, frontCanvas);
		// Sans WebGL, les halos flous en CSS prennent le relais
		root.dataset.lava = lavaLamp ? "webgl" : "css";
		lavaLampRef.current = lavaLamp;
		effectsRef.current = backgroundEffects;

		return () => {
			lavaLamp?.destroy();
			backgroundEffects.destroy();
			lavaLampRef.current = null;
			effectsRef.current = null;
		};
	}, []);

	useEffect(() => {
		lavaLampRef.current?.setPalette(decorations, durationSeconds, isDark);
	}, [decorations, durationSeconds, isDark]);

	useEffect(() => {
		effectsRef.current?.setEffect(effect, effectPalette);
	}, [effect, effectPalette]);

	// Animations réduites : lampe à lave figée, pas de fond animé de projet
	useEffect(() => {
		lavaLampRef.current?.setReduced(reducedMotion);
		effectsRef.current?.setEnabled(!reducedMotion);
	}, [reducedMotion]);

	useEffect(() => {
		lavaLampRef.current?.setNarrow(isNarrow);
	}, [isNarrow]);

	return (
		<div
			ref={rootRef}
			className={styles.background}
			aria-hidden
		>
			<canvas
				ref={backCanvasRef}
				className={styles.canvas}
			/>
			<canvas
				ref={lavaCanvasRef}
				className={styles.lava}
			/>
			<div className={styles.halos}>
				<i />
				<i />
				<i />
				<i />
			</div>
			<canvas
				ref={frontCanvasRef}
				className={styles.canvas}
			/>
		</div>
	);
}
