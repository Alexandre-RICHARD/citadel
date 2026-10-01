import { ChevronDown, ChevronRight } from "lucide-react";

import styles from "./expandToggle.module.scss";

type Props = {
	expanded: boolean;
	onToggle: () => void;
	expandLabel: string;
	collapseLabel: string;
	size?: "md" | "lg";
};

export function ExpandToggle({
	expanded,
	onToggle,
	expandLabel,
	collapseLabel,
	size = "md",
}: Props) {
	const iconSize = size === "lg" ? 20 : 18;

	return (
		<button
			type="button"
			className={styles.expandToggle}
			data-size={size}
			onClick={onToggle}
			aria-expanded={expanded}
			aria-label={expanded ? collapseLabel : expandLabel}
		>
			{expanded ? (
				<ChevronDown size={iconSize} />
			) : (
				<ChevronRight size={iconSize} />
			)}
		</button>
	);
}
