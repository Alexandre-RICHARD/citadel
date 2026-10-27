import { type Ref, useId } from "react";

import styles from "./logo.module.scss";
import { logoBars } from "./logoBars";

type Props = {
	ref?: Ref<SVGSVGElement>;
	className?: string;
};

// Le logo hexagonal et son A, dessiné pour tomber au centre de l'hexagone. Barres (data-logo-bar) et lettre
// (data-logo-letter) sont repérées par l'animation de l'intro ; chaque barre est prise dans deux groupes, l'un
// pour tourner autour du centre (data-logo-orbit), l'autre pour s'en écarter (data-logo-drift), qui servent au
// survol du logo
export function Logo({ ref, className }: Props) {
	// Un dégradé par logo : celui de l'intro et celui du header sont affichés ensemble
	const gradientId = `logo-${useId().replace(/[^\w-]/g, "")}`;

	return (
		<svg
			ref={ref}
			className={[styles.logo, className].filter(Boolean).join(" ")}
			viewBox="-10.5 -10.5 21 21"
			aria-hidden
		>
			<defs>
				<linearGradient id={gradientId}>
					<stop
						offset="0"
						className={styles.barBase}
					/>
					<stop
						offset="1"
						className={styles.barTip}
					/>
				</linearGradient>
			</defs>
			{logoBars.map((bar) => (
				<g
					key={bar.transform}
					data-logo-orbit
				>
					<g data-logo-drift>
						<g transform={bar.transform}>
							<polygon
								points={bar.points}
								fill={`url(#${gradientId})`}
								data-logo-bar
							/>
						</g>
					</g>
				</g>
			))}
			<path
				fillRule="evenodd"
				d="M-0.75 -3.5H0.75L3.3 3.5H1.8L1.254 2H-1.254L-1.8 3.5H-3.3Z M0 -1.44L0.798 0.75H-0.798Z"
				data-logo-letter
			/>
		</svg>
	);
}
