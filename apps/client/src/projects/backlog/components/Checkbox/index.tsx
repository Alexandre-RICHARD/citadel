import { Check, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { joinClassNames } from "../../helper/dom/joinClassNames";
import { Tooltip } from "../Tooltip";
import styles from "./checkbox.module.scss";

type Props = {
	checked: boolean;
	onChange: (checked: boolean) => void;
	/** Sans libellé visible (cellule du tableau), `ariaLabel` nomme la case */
	label?: ReactNode;
	/** Précision sous le libellé */
	description?: ReactNode;
	ariaLabel?: string | undefined;
	disabled?: boolean;
	/** Case à cocher, interrupteur (réglage appliqué tout de suite) ou pastille à bascule */
	variant?: "checkbox" | "switch" | "chip";
	/** Icône de la pastille */
	icon?: LucideIcon | undefined;
	size?: "sm" | "md";
	tooltip?: ReactNode;
	className?: string | undefined;
};

/** Case à cocher maison autour d'une vraie case : clavier, formulaire et lecteurs d'écran restent ceux du navigateur */
export function Checkbox({
	checked,
	onChange,
	label,
	description,
	ariaLabel,
	disabled = false,
	variant = "checkbox",
	icon: Icon,
	size = "md",
	tooltip,
	className,
}: Props) {
	const hasLabel = label !== undefined && label !== null && label !== false;
	const text = hasLabel && (
		<span className={styles.text}>
			<span className={styles.label}>{label}</span>
			{description !== undefined && (
				<span className={styles.description}>{description}</span>
			)}
		</span>
	);

	let field: ReactNode;
	if (variant === "chip") {
		field = (
			<label
				className={joinClassNames(
					styles.chip,
					checked && styles.chipChecked,
					disabled && styles.disabled,
					className,
				)}
			>
				<input
					type="checkbox"
					className={styles.hiddenInput}
					checked={checked}
					disabled={disabled}
					aria-label={ariaLabel}
					onChange={(event) => onChange(event.target.checked)}
				/>
				{Icon !== undefined && (
					<Icon
						className={styles.chipIcon}
						aria-hidden
					/>
				)}
				{label}
			</label>
		);
	} else {
		field = (
			<label
				className={joinClassNames(
					styles.field,
					styles[size],
					disabled && styles.disabled,
					className,
				)}
			>
				{variant === "switch" ? (
					<input
						type="checkbox"
						role="switch"
						className={styles.switch}
						checked={checked}
						disabled={disabled}
						aria-label={ariaLabel}
						onChange={(event) => onChange(event.target.checked)}
					/>
				) : (
					<span className={styles.control}>
						<input
							type="checkbox"
							className={styles.box}
							checked={checked}
							disabled={disabled}
							aria-label={ariaLabel}
							onChange={(event) => onChange(event.target.checked)}
						/>
						<Check
							className={styles.checkIcon}
							strokeWidth={3}
							aria-hidden
						/>
					</span>
				)}
				{text}
			</label>
		);
	}

	return <Tooltip content={tooltip}>{field}</Tooltip>;
}
