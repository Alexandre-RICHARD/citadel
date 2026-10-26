import {
	CircleAlert,
	CircleCheck,
	Info,
	type LucideIcon,
	TriangleAlert,
} from "lucide-react";
import type { ReactNode } from "react";

import { joinClassNames } from "../../helper/dom/joinClassNames";
import { Spinner } from "../Spinner";
import styles from "./callout.module.scss";

type Tone = "info" | "warning" | "danger" | "success" | "loading";

const toneIcons: Record<Exclude<Tone, "loading">, LucideIcon> = {
	info: Info,
	warning: TriangleAlert,
	danger: CircleAlert,
	success: CircleCheck,
};

/** Encart d'information, d'avertissement, d'erreur ou de chargement, avec son icône */
export function Callout({
	tone = "info",
	icon,
	children,
	className,
}: {
	tone?: Tone;
	/** Icône à la place de celle du ton */
	icon?: LucideIcon | undefined;
	children: ReactNode;
	className?: string | undefined;
}) {
	const Icon = tone === "loading" ? null : (icon ?? toneIcons[tone]);

	return (
		<div
			className={joinClassNames(styles.callout, styles[tone], className)}
			role={tone === "danger" ? "alert" : undefined}
		>
			{Icon === null ? (
				<Spinner className={styles.icon} />
			) : (
				<Icon
					className={styles.icon}
					aria-hidden
				/>
			)}
			<div className={styles.content}>{children}</div>
		</div>
	);
}
