import { clamp } from "@citadel/common/src/universal/number/clamp";
import { X } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef } from "react";

import type { ShowcaseProject } from "../../../../routing/showcaseProject.type";
import { ProgressRing } from "../ProgressRing";
import { createWheelMotion } from "./createWheelMotion";
import styles from "./projectWheel.module.scss";
import type { WheelOrientationEnum } from "./wheelOrientation.enum";

type Props = {
	projects: ShowcaseProject[];
	selectedProject: ShowcaseProject | null;
	orientation: WheelOrientationEnum;
	reducedMotion: boolean;
	onSelect: (project: ShowcaseProject) => void;
	onClear: () => void;
};

type WheelMotion = ReturnType<typeof createWheelMotion>;

// La roue des projets, comme le menu de BF3 : une boîte par projet, sur un arc. Un clic sélectionne le projet et
// l'amène au centre ; la croix, dans le creux de l'arc, revient à l'accueil
export function ProjectWheel({
	projects,
	selectedProject,
	orientation,
	reducedMotion,
	onSelect,
	onClear,
}: Props) {
	const rootRef = useRef<HTMLElement>(null);
	const arcLineRef = useRef<SVGPathElement>(null);
	const minorTicksRef = useRef<SVGPathElement>(null);
	const majorTicksRef = useRef<SVGPathElement>(null);
	const clearButtonRef = useRef<HTMLButtonElement>(null);
	const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const motionRef = useRef<WheelMotion | null>(null);

	const selectedIndex = selectedProject
		? projects.indexOf(selectedProject)
		: -1;
	const hasSelection = selectedIndex >= 0;

	useEffect(() => {
		const root = rootRef.current;
		const arcLine = arcLineRef.current;
		const minorTicks = minorTicksRef.current;
		const majorTicks = majorTicksRef.current;
		const clearButton = clearButtonRef.current;
		if (!root || !arcLine || !minorTicks || !majorTicks || !clearButton)
			return undefined;

		const motion = createWheelMotion({
			root,
			arcLine,
			minorTicks,
			majorTicks,
			clearButton,
		});
		motionRef.current = motion;
		return () => {
			motion.destroy();
			motionRef.current = null;
		};
	}, []);

	// Lus une fois les boîtes rendues : la sélection de départ place la roue sans animation
	const initialSelectedIndex = useRef(selectedIndex);
	useEffect(() => {
		const items = itemRefs.current
			.slice(0, projects.length)
			.filter((item) => item !== null);
		const index = initialSelectedIndex.current;
		motionRef.current?.setItems(items, index >= 0 ? index : null);
	}, [projects]);

	useEffect(() => {
		motionRef.current?.setSelectedIndex(hasSelection ? selectedIndex : null);
	}, [selectedIndex, hasSelection]);

	useEffect(() => {
		motionRef.current?.setOrientation(orientation);
	}, [orientation]);

	useEffect(() => {
		motionRef.current?.setReducedMotion(reducedMotion);
	}, [reducedMotion]);

	function handleItemClick(project: ShowcaseProject) {
		if (motionRef.current?.isDragClick()) return;
		onSelect(project);
	}

	// Flèches, Début et Fin : le focus passe d'une boîte à l'autre, la roue suit
	function handleItemKeyDown(event: KeyboardEvent, index: number) {
		const lastIndex = projects.length - 1;
		const nextIndexByKey: Partial<Record<string, number>> = {
			ArrowDown: index + 1,
			ArrowRight: index + 1,
			ArrowUp: index - 1,
			ArrowLeft: index - 1,
			Home: 0,
			End: lastIndex,
		};
		const nextIndex = nextIndexByKey[event.key];
		if (nextIndex === undefined) return;
		event.preventDefault();
		itemRefs.current[clamp(nextIndex, 0, lastIndex)]?.focus({
			preventScroll: true,
		});
	}

	return (
		<nav
			ref={rootRef}
			className={styles.wheel}
			aria-label="Projets"
			data-orientation={orientation}
			data-reveal="wheel"
		>
			<svg
				className={styles.arc}
				aria-hidden
			>
				<path
					ref={arcLineRef}
					className={styles.arcLine}
				/>
				<path
					ref={minorTicksRef}
					className={styles.arcLine}
				/>
				<path
					ref={majorTicksRef}
					className={styles.majorTicks}
				/>
			</svg>
			<button
				ref={clearButtonRef}
				type="button"
				className={styles.clearButton}
				data-visible={hasSelection}
				tabIndex={hasSelection ? 0 : -1}
				aria-hidden={!hasSelection}
				aria-label="Revenir à l’accueil"
				title="Revenir à l’accueil"
				onClick={onClear}
			>
				<X aria-hidden />
			</button>
			<div className={styles.items}>
				{projects.map((project, index) => (
					<button
						key={project.id}
						ref={(item) => {
							itemRefs.current[index] = item;
						}}
						type="button"
						className={styles.item}
						aria-pressed={index === selectedIndex}
						onClick={() => handleItemClick(project)}
						onKeyDown={(event) => handleItemKeyDown(event, index)}
						onFocus={() => motionRef.current?.focusIndex(index)}
					>
						<span data-reskin>{project.name}</span>
						<ProgressRing value={project.showcase.progress} />
					</button>
				))}
			</div>
		</nav>
	);
}
