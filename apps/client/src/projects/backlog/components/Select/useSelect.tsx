import { type KeyboardEvent, useRef, useState } from "react";

import type { SelectOption } from "./selectOption.type";

/** Frappe rapide : les lettres tapées à moins de ce délai d'écart s'enchaînent */
const typeaheadResetMs = 600;

/** Sans accents ni majuscules : « e » trouve « Édition » */
function normalize(text: string): string {
	return text
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase();
}

/**
 * Liste déroulante au clavier (motif « combobox » à sélection seule) : le focus reste sur le déclencheur, la valeur active
 * se déplace avec les flèches, Début, Fin, Page préc./suiv. et la frappe rapide ; Entrée ou Espace choisit, Échap et Tab ferment.
 */
export function useSelect<V extends string>({
	value,
	options,
	onChange,
}: {
	value: V | null;
	options: readonly SelectOption<V>[];
	onChange: (value: V) => void;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const typeahead = useRef({ text: "", resetAt: 0 });
	const selectedIndex = options.findIndex((option) => option.value === value);

	/** La première valeur active à partir de `from`, dans le sens `step` ; -1 s'il n'y en a pas */
	function findEnabledIndex(from: number, step: 1 | -1): number {
		for (
			let index = from;
			index >= 0 && index < options.length;
			index += step
		) {
			if (options[index]?.disabled !== true) {
				return index;
			}
		}
		return -1;
	}

	function moveActive(from: number, step: 1 | -1) {
		const index = findEnabledIndex(from, step);
		if (index !== -1) {
			setActiveIndex(index);
		}
	}

	function open() {
		setActiveIndex(selectedIndex >= 0 ? selectedIndex : findEnabledIndex(0, 1));
		setIsOpen(true);
	}

	function close() {
		setIsOpen(false);
	}

	function choose(index: number) {
		const option = options[index];
		if (option === undefined || option.disabled === true) {
			return;
		}
		setIsOpen(false);
		if (option.value !== value) {
			onChange(option.value);
		}
	}

	/** La valeur suivante dont le libellé commence par les lettres tapées */
	function typeAhead(character: string) {
		const now = Date.now();
		const text =
			now > typeahead.current.resetAt
				? character
				: typeahead.current.text + character;
		typeahead.current = { text, resetAt: now + typeaheadResetMs };
		const searched = normalize(text);
		const start = text.length === 1 ? activeIndex + 1 : activeIndex;
		const ordered = [
			...options.slice(Math.max(start, 0)),
			...options.slice(0, Math.max(start, 0)),
		];
		const match = ordered.find(
			(option) =>
				option.disabled !== true &&
				normalize(option.label).startsWith(searched),
		);
		if (match !== undefined) {
			setActiveIndex(options.indexOf(match));
		}
	}

	function isTypingCharacter(event: KeyboardEvent<HTMLElement>): boolean {
		return (
			event.key.length === 1 &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.altKey
		);
	}

	function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
		const isTypeaheadActive = Date.now() <= typeahead.current.resetAt;
		if (!isOpen) {
			if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
				event.preventDefault();
				open();
			} else if (isTypingCharacter(event)) {
				open();
				typeAhead(event.key);
			}
			return;
		}
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				moveActive(activeIndex + 1, 1);
				break;
			case "ArrowUp":
				event.preventDefault();
				moveActive(activeIndex - 1, -1);
				break;
			case "Home":
				event.preventDefault();
				moveActive(0, 1);
				break;
			case "End":
				event.preventDefault();
				moveActive(options.length - 1, -1);
				break;
			case "PageDown":
				event.preventDefault();
				moveActive(Math.min(activeIndex + 10, options.length - 1), -1);
				break;
			case "PageUp":
				event.preventDefault();
				moveActive(Math.max(activeIndex - 10, 0), 1);
				break;
			case "Enter":
				event.preventDefault();
				choose(activeIndex);
				break;
			case "Escape":
				// Échap ferme la liste seulement, pas la fenêtre qui la contient
				event.preventDefault();
				event.stopPropagation();
				close();
				break;
			case "Tab":
				close();
				break;
			default:
				// Espace choisit, sauf au milieu d'une frappe rapide (« Bac à sable »)
				if (event.key === " " && !isTypeaheadActive) {
					event.preventDefault();
					choose(activeIndex);
				} else if (isTypingCharacter(event)) {
					typeAhead(event.key);
				}
		}
	}

	return {
		isOpen,
		activeIndex,
		selectedIndex,
		setActiveIndex,
		open,
		close,
		choose,
		handleKeyDown,
	};
}
