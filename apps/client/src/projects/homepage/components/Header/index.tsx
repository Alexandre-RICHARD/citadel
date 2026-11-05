import { ColorSchemeEnum } from "@citadel/design-system/src/theme/colorScheme/colorScheme.enum";
import { Moon, Sun } from "lucide-react";
import type { RefObject } from "react";
import { Link } from "react-router";

import { useLogoOrbit } from "../../hooks/useLogoOrbit";
import { buildHomepagePath } from "../../routing/buildHomepagePath";
import { HeaderAccount } from "../HeaderAccount";
import { Logo } from "../Logo";
import styles from "./header.module.scss";

type Props = {
	// Le logo du header : l'intro y fait atterrir le sien
	logoRef: RefObject<SVGSVGElement | null>;
	colorScheme: ColorSchemeEnum;
	onToggleColorScheme: () => void;
	reducedMotion: boolean;
};

// Transparent : le logo et le nom du site à gauche, le choix clair ou sombre puis le compte à droite
export function Header({
	logoRef,
	colorScheme,
	onToggleColorScheme,
	reducedMotion,
}: Props) {
	useLogoOrbit(logoRef, reducedMotion);

	const colorSchemeLabel = `Passer au thème ${colorScheme === ColorSchemeEnum.Dark ? "clair" : "sombre"}`;

	return (
		<header className={styles.header}>
			<Link
				to={buildHomepagePath()}
				className={styles.brand}
				aria-label="Accueil de La Citadel d’Alex"
			>
				<Logo
					ref={logoRef}
					className={styles.logo}
				/>
				<span
					className={styles.brandName}
					data-reskin
					data-reveal="brand"
				>
					La Citadel d’Alex
				</span>
			</Link>
			<div
				className={styles.actions}
				data-reveal="actions"
			>
				<button
					type="button"
					className={styles.iconButton}
					onClick={onToggleColorScheme}
					aria-label={colorSchemeLabel}
					title={colorSchemeLabel}
				>
					{colorScheme === ColorSchemeEnum.Dark ? (
						<Moon aria-hidden />
					) : (
						<Sun aria-hidden />
					)}
				</button>
				<HeaderAccount />
			</div>
		</header>
	);
}
