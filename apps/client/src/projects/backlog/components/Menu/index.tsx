import { ExternalLink } from "lucide-react";
import { type KeyboardEvent, type RefObject, useRef } from "react";

import { joinClassNames } from "../../utils";
import { Popover } from "../Popover";
import type { PopoverPlacement } from "../Popover/popoverPlacement.type";
import { Tooltip } from "../Tooltip";
import styles from "./menu.module.scss";
import type { MenuItem } from "./menuItem.type";

type Props = {
	anchorRef: RefObject<HTMLElement | null>;
	items: MenuItem[];
	ariaLabel: string;
	/** Fermeture : Échap, Tab ou entrée choisie ; le clic à côté est géré par la page */
	onClose: () => void;
	placement?: PopoverPlacement;
};

/**
 * Menu d'actions : le focus va sur la première entrée à l'ouverture et revient au bouton à la fermeture.
 * Flèches, Début et Fin parcourent les entrées, une lettre va à la suivante qui commence par elle.
 * Une entrée inactive reste atteignable, pour lire sa raison en info-bulle.
 */
export function Menu({
	anchorRef,
	items,
	ariaLabel,
	onClose,
	placement = "bottom-end",
}: Props) {
	const listRef = useRef<HTMLUListElement>(null);

	function getEntries(): HTMLElement[] {
		return [
			...(listRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ??
				[]),
		];
	}

	function focusEntry(index: number) {
		const entries = getEntries();
		entries.at(index % entries.length)?.focus();
	}

	function handleKeyDown(event: KeyboardEvent<HTMLUListElement>) {
		const entries = getEntries();
		const current = entries.findIndex(
			(entry) => entry === document.activeElement,
		);
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				focusEntry(current + 1);
				break;
			case "ArrowUp":
				event.preventDefault();
				focusEntry(current <= 0 ? entries.length - 1 : current - 1);
				break;
			case "Home":
				event.preventDefault();
				focusEntry(0);
				break;
			case "End":
				event.preventDefault();
				focusEntry(entries.length - 1);
				break;
			case "Escape":
				event.preventDefault();
				event.stopPropagation();
				onClose();
				break;
			case "Tab":
				// Le focus repart du bouton du menu : Tab passe à l'élément qui le suit
				anchorRef.current?.focus();
				onClose();
				break;
			default:
				if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
					const letter = event.key.toLowerCase();
					const ordered = [
						...entries.slice(current + 1),
						...entries.slice(0, current + 1),
					];
					ordered
						.find((entry) =>
							(entry.textContent ?? "").trim().toLowerCase().startsWith(letter),
						)
						?.focus();
				}
		}
	}

	return (
		<Popover
			anchorRef={anchorRef}
			placement={placement}
			focusOnOpen="first"
			returnsFocus
			className={styles.panel}
		>
			<ul
				ref={listRef}
				role="menu"
				aria-label={ariaLabel}
				className={styles.menu}
				onKeyDown={handleKeyDown}
			>
				{items.map(
					({
						label,
						icon: Icon,
						href,
						disabledReason,
						isDanger = false,
						isGroupStart = false,
						onSelect,
					}) => (
						<li
							key={label}
							role="none"
							className={isGroupStart ? styles.groupStart : undefined}
						>
							{href === null ? (
								<Tooltip
									content={disabledReason}
									placement="left"
									className={styles.entryTooltip}
								>
									<button
										type="button"
										role="menuitem"
										tabIndex={-1}
										className={joinClassNames(
											styles.entry,
											isDanger && styles.danger,
										)}
										aria-disabled={disabledReason !== null || undefined}
										onClick={() => {
											if (disabledReason === null) {
												onClose();
												onSelect();
											}
										}}
									>
										<Icon
											className={styles.icon}
											aria-hidden
										/>
										{label}
									</button>
								</Tooltip>
							) : (
								<a
									role="menuitem"
									tabIndex={-1}
									className={styles.entry}
									href={href}
									target="_blank"
									rel="noreferrer"
									onClick={onClose}
								>
									<Icon
										className={styles.icon}
										aria-hidden
									/>
									{label}
									<ExternalLink
										className={styles.externalIcon}
										aria-hidden
									/>
								</a>
							)}
						</li>
					),
				)}
			</ul>
		</Popover>
	);
}
