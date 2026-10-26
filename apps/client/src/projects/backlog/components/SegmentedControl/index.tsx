import type { LucideIcon } from "lucide-react";
import { useId } from "react";

import { joinClassNames } from "../../helper/dom/joinClassNames";
import styles from "./segmentedControl.module.scss";

type Props<V extends string> = {
	value: V;
	options: readonly { value: V; label: string; icon?: LucideIcon }[];
	onChange: (value: V) => void;
	ariaLabel: string;
	className?: string | undefined;
};

/** Choix unique parmi quelques valeurs, toutes visibles : de vrais boutons radio, les flèches passent d'une valeur à l'autre */
export function SegmentedControl<V extends string>({
	value,
	options,
	onChange,
	ariaLabel,
	className,
}: Props<V>) {
	const name = useId();

	return (
		<div
			role="radiogroup"
			aria-label={ariaLabel}
			className={joinClassNames(styles.group, className)}
		>
			{options.map(({ value: optionValue, label, icon: Icon }) => (
				<label
					key={optionValue}
					className={joinClassNames(
						styles.option,
						optionValue === value && styles.selected,
					)}
				>
					<input
						type="radio"
						className={styles.input}
						name={name}
						value={optionValue}
						checked={optionValue === value}
						onChange={() => onChange(optionValue)}
					/>
					{Icon !== undefined && (
						<Icon
							className={styles.icon}
							aria-hidden
						/>
					)}
					{label}
				</label>
			))}
		</div>
	);
}
