import {
	type RefObject,
	useEffectEvent,
	useLayoutEffect,
	useRef,
	useState,
} from "react";

import { playIntro } from "../../effects/intro/playIntro";
import { Logo } from "../Logo";
import styles from "./intro.module.scss";

type Props = {
	headerLogoRef: RefObject<SVGSVGElement | null>;
	onReveal: () => void;
	onDone: () => void;
};

// Le logo se dessine sur un cache aux couleurs de l'ambiance, puis rejoint le header. Une fois par session
export function Intro({ headerLogoRef, onReveal, onDone }: Props) {
	const introRef = useRef<HTMLDivElement>(null);
	const backgroundRef = useRef<HTMLDivElement>(null);
	const logoRef = useRef<SVGSVGElement>(null);
	const [isPlaying, setIsPlaying] = useState(true);
	// Lus au moment où ils servent : un nouveau rendu du Layout ne relance pas l'intro
	const handleReveal = useEffectEvent(onReveal);
	const handleDone = useEffectEvent(() => {
		setIsPlaying(false);
		onDone();
	});

	// Avant l'affichage : la page est masquée dès la première image
	useLayoutEffect(() => {
		const background = backgroundRef.current;
		const introLogo = logoRef.current;
		const headerLogo = headerLogoRef.current;
		// Le Layout, dont les parties (data-reveal) apparaissent à la fin de l'intro. Lu dans le DOM : à ce stade,
		// React n'a pas encore posé les refs des parents
		const scope = introRef.current?.parentElement;
		if (!background || !introLogo || !headerLogo || !scope) return undefined;

		return playIntro({
			introLogo,
			background,
			headerLogo,
			scope,
			onReveal: () => handleReveal(),
			onDone: () => handleDone(),
		});
	}, [headerLogoRef]);

	if (!isPlaying) return null;

	return (
		<div
			ref={introRef}
			className={styles.intro}
		>
			<div
				ref={backgroundRef}
				className={styles.background}
			/>
			<Logo
				ref={logoRef}
				className={styles.logo}
			/>
		</div>
	);
}
