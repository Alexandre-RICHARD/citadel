import { ChevronDown } from "lucide-react";
import { type ReactNode, useRef, useState } from "react";

import styles from "../../../../backlog.module.scss";
import { Popover } from "../../../../components/Popover";
import { Tooltip } from "../../../../components/Tooltip";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";

type Props = {
	label: string;
	// null sans filtre
	summary: string | null;
	children: ReactNode;
};

/**
 * Filtre d'un intervalle (nombres, temps, dates) : un bouton aussi étroit que la colonne résume les bornes, les deux
 * champs s'ouvrent dans un panneau. Échap ou Entrée le referment
 */
export function RangeFilter({ label, summary, children }: Props) {
	const triggerRef = useRef<HTMLButtonElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const fullLabel = summary === null ? label : `${label} : ${summary}`;

	return (
		<>
			<Tooltip content={summary === null ? null : fullLabel}>
				<button
					ref={triggerRef}
					type="button"
					className={joinClassNames(
						styles.filterTrigger,
						summary !== null && styles.activeFilter,
					)}
					aria-label={fullLabel}
					aria-haspopup="dialog"
					aria-expanded={isOpen}
					onClick={() => setIsOpen(!isOpen)}
				>
					<span className={styles.filterSummary}>{summary ?? "Tous"}</span>
					<ChevronDown aria-hidden />
				</button>
			</Tooltip>
			{isOpen && (
				<Popover
					anchorRef={triggerRef}
					role="dialog"
					ariaLabel={label}
					focusOnOpen="first"
					returnsFocus
					className={styles.rangePopover}
					onClickOutside={() => setIsOpen(false)}
					onKeyDown={(event) => {
						// Entrée dans un champ de borne valide et referme ; pas sur un jour du calendrier
						if (
							event.key === "Escape" ||
							(event.key === "Enter" &&
								event.target instanceof HTMLInputElement)
						) {
							event.stopPropagation();
							setIsOpen(false);
						}
					}}
				>
					<p className={styles.popoverTitle}>{label}</p>
					<div className={styles.rangeFields}>{children}</div>
				</Popover>
			)}
		</>
	);
}
