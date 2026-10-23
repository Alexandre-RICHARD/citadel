import type { LucideIcon } from "lucide-react";
import type {
	KeyboardEvent,
	MouseEvent,
	PointerEvent,
	ReactNode,
	Ref,
} from "react";

import { joinClassNames } from "../../utils";
import type { PopoverPlacement } from "../Popover/popoverPlacement.type";
import { Spinner } from "../Spinner";
import { Tooltip } from "../Tooltip";
import styles from "./button.module.scss";

type Props = {
	/** Sans libellé, le bouton n'a que son icône : `ariaLabel` le nomme */
	children?: ReactNode;
	icon?: LucideIcon | undefined;
	trailingIcon?: LucideIcon | undefined;
	variant?: "primary" | "secondary" | "ghost" | "danger";
	size?: "sm" | "md";
	ariaLabel?: string | undefined;
	ariaPressed?: boolean | undefined;
	ariaExpanded?: boolean | undefined;
	ariaHaspopup?: "menu" | "listbox" | "dialog" | undefined;
	ariaControls?: string | undefined;
	/** Info-bulle au survol et au focus clavier */
	tooltip?: ReactNode;
	tooltipPlacement?: PopoverPlacement;
	disabled?: boolean;
	/** Action en cours : roue à la place de l'icône */
	isLoading?: boolean;
	className?: string | undefined;
	ref?: Ref<HTMLButtonElement> | undefined;
	onClick?: ((event: MouseEvent<HTMLButtonElement>) => void) | undefined;
	onKeyDown?: ((event: KeyboardEvent<HTMLButtonElement>) => void) | undefined;
	onPointerDown?:
		((event: PointerEvent<HTMLButtonElement>) => void) | undefined;
};

/** Bouton : primaire (l'action de la fenêtre), secondaire, discret ou destructif ; avec ou sans libellé */
export function Button({
	children,
	icon: Icon,
	trailingIcon: TrailingIcon,
	variant = "secondary",
	size = "md",
	ariaLabel,
	ariaPressed,
	ariaExpanded,
	ariaHaspopup,
	ariaControls,
	tooltip,
	tooltipPlacement = "top",
	disabled = false,
	isLoading = false,
	className,
	ref,
	onClick,
	onKeyDown,
	onPointerDown,
}: Props) {
	const hasLabel =
		children !== undefined && children !== null && children !== false;
	const button = (
		<button
			ref={ref}
			type="button"
			className={joinClassNames(
				styles.button,
				styles[variant],
				styles[size],
				!hasLabel && styles.iconOnly,
				className,
			)}
			aria-label={ariaLabel}
			aria-pressed={ariaPressed}
			aria-expanded={ariaExpanded}
			aria-haspopup={ariaHaspopup}
			aria-controls={ariaControls}
			aria-busy={isLoading || undefined}
			disabled={disabled}
			onClick={onClick}
			onKeyDown={onKeyDown}
			onPointerDown={onPointerDown}
		>
			{isLoading ? (
				<Spinner />
			) : (
				Icon !== undefined && (
					<Icon
						className={styles.icon}
						aria-hidden
					/>
				)
			)}
			{hasLabel && <span className={styles.label}>{children}</span>}
			{TrailingIcon !== undefined && (
				<TrailingIcon
					className={styles.icon}
					aria-hidden
				/>
			)}
		</button>
	);

	return (
		<Tooltip
			content={tooltip}
			placement={tooltipPlacement}
		>
			{button}
		</Tooltip>
	);
}
