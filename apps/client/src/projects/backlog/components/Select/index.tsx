import { Check, ChevronDown } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";

import { joinClassNames } from "../../utils";
import { Popover } from "../Popover";
import styles from "./select.module.scss";
import type { SelectOption } from "./selectOption.type";
import { useSelect } from "./useSelect";

type Props<V extends string> = {
	value: V | null;
	options: readonly SelectOption<V>[];
	onChange: (value: V) => void;
	ariaLabel: string;
	/** Affiché sans valeur choisie */
	placeholder?: ReactNode;
	size?: "sm" | "md";
	/** Champ de formulaire, ou cellule du tableau : se lit comme sa valeur, le cadre n'apparaît qu'au survol */
	variant?: "field" | "inline";
	disabled?: boolean;
	/** Mis en valeur, ex. un filtre appliqué */
	isHighlighted?: boolean;
	/** Champ réduit à sa valeur, centrée, sans chevron (filtres des colonnes étroites) */
	isCompact?: boolean;
	className?: string | undefined;
	id?: string | undefined;
};

/** Liste déroulante maison : la liste s'ouvre dans un portail, au clavier comme à la souris (voir `useSelect`) */
export function Select<V extends string>({
	value,
	options,
	onChange,
	ariaLabel,
	placeholder = "Choisir…",
	size = "md",
	variant = "field",
	disabled = false,
	isHighlighted = false,
	isCompact = false,
	className,
	id,
}: Props<V>) {
	const triggerRef = useRef<HTMLButtonElement>(null);
	const listRef = useRef<HTMLUListElement>(null);
	const listId = useId();
	const {
		isOpen,
		activeIndex,
		selectedIndex,
		setActiveIndex,
		open,
		close,
		choose,
		handleKeyDown,
	} = useSelect({ value, options, onChange });
	const selected = options.at(selectedIndex);

	// La valeur active reste visible dans une longue liste
	useEffect(() => {
		if (isOpen && activeIndex >= 0) {
			listRef.current?.children
				.item(activeIndex)
				?.scrollIntoView({ block: "nearest" });
		}
	}, [isOpen, activeIndex]);

	return (
		<>
			<button
				ref={triggerRef}
				type="button"
				role="combobox"
				id={id}
				className={joinClassNames(
					styles.trigger,
					styles[size],
					styles[variant],
					isHighlighted && styles.highlighted,
					isCompact && styles.compact,
					className,
				)}
				aria-label={ariaLabel}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				aria-controls={isOpen ? listId : undefined}
				aria-activedescendant={
					isOpen && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
				}
				disabled={disabled}
				onClick={() => (isOpen ? close() : open())}
				onKeyDown={handleKeyDown}
			>
				<span className={styles.value}>
					{selectedIndex >= 0 && selected !== undefined ? (
						(selected.triggerContent ?? selected.content ?? selected.label)
					) : (
						<span className={styles.placeholder}>{placeholder}</span>
					)}
				</span>
				{!isCompact && (
					<ChevronDown
						className={styles.chevron}
						aria-hidden
					/>
				)}
			</button>
			{isOpen && (
				<Popover
					anchorRef={triggerRef}
					matchAnchorWidth
					onClickOutside={close}
					className={styles.panel}
				>
					<ul
						ref={listRef}
						id={listId}
						role="listbox"
						aria-label={ariaLabel}
						className={styles.list}
						// Le focus reste sur le déclencheur pendant le choix à la souris
						onMouseDown={(event) => event.preventDefault()}
					>
						{options.map((option, index) => (
							// eslint-disable-next-line jsx-a11y/click-events-have-key-events -- le clavier passe par le déclencheur (combobox)
							<li
								key={option.value}
								id={`${listId}-${index}`}
								role="option"
								tabIndex={-1}
								aria-selected={index === selectedIndex}
								aria-disabled={option.disabled === true || undefined}
								className={joinClassNames(
									styles.option,
									index === activeIndex && styles.active,
								)}
								onPointerMove={() => {
									if (option.disabled !== true && index !== activeIndex) {
										setActiveIndex(index);
									}
								}}
								onClick={() => choose(index)}
							>
								<Check
									className={styles.optionCheck}
									aria-hidden
								/>
								<span className={styles.optionLabel}>
									{option.content ?? option.label}
								</span>
								{option.hint !== undefined && (
									<span className={styles.optionHint}>{option.hint}</span>
								)}
							</li>
						))}
					</ul>
				</Popover>
			)}
		</>
	);
}
