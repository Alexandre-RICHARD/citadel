import { stringSearcher } from "@citadel/common/src/universal/string/stringSearcher";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./dropdown.module.scss";
import type { DropdownPositionType } from "./dropdownPosition.type";
import type { SelectItemsType } from "./selectedItems.type";
import type { SelectSearchType } from "./selectSearch.type";

const DEFAULT_SEARCH_PLACEHOLDER = "Type to filter items";

const isTop = (position: string) => {
	return ["top-left", "top-right"].includes(position);
};

const isLeft = (position: string) => {
	return ["bottom-left", "top-left"].includes(position);
};

type PropsType<T extends string> = {
	selectorId: string;
	items: SelectItemsType<T>[];
	selectedItem: T | undefined;
	position: DropdownPositionType;
	onSelect: (selectedItem: T | undefined) => void;
	onClose: () => void;
	search: SelectSearchType | undefined;
};

export function Dropdown<T extends string>({
	selectorId,
	items,
	selectedItem,
	position,
	onSelect,
	onClose,
	search,
}: PropsType<T>): React.JSX.Element {
	const [itemFocused, setItemFocused] = useState<number>(
		items.findIndex((item) => item.value === selectedItem),
	);
	const [defaultSearchString, setDefaultSearchString] = useState<string>("");

	const [searchString, setSearchString] = search?.isHandlingCustomSearch
		? [search.customSearchString, search.customOnChangeSearch]
		: [defaultSearchString, setDefaultSearchString];

	const dropdownId = `${selectorId}-dropdown-container`;
	const itemsContainerRef = useRef<HTMLDivElement>(null);

	const filteredItems = items.filter((item) =>
		stringSearcher({
			searchString,
			value: item.search,
			strictMode: !!search?.strictMode,
		}),
	);
	const filteredItemsCount = filteredItems.length;

	const selectItem = (value: T) => {
		onSelect(value);
		onClose();
	};

	const handleSearchChange = (newSearchString: string) => {
		setSearchString(newSearchString);
		setItemFocused(-1);
	};

	const handleSearchKeyDown = (
		event: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (event.key !== "Enter") return;
		const highlightedItem = filteredItems[Math.max(itemFocused, 0)];
		if (highlightedItem) selectItem(highlightedItem.value);
	};

	const handleAllClick = useCallback(
		(event: MouseEvent) => {
			const dropdown = document.getElementById(dropdownId);
			const selectorButton = document.getElementById(selectorId);
			if (
				!dropdown?.contains(event.target as Node) &&
				!selectorButton?.contains(event.target as Node)
			) {
				onClose();
			}
		},
		[dropdownId, onClose, selectorId],
	);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			switch (event.key) {
				case "ArrowUp": {
					event.preventDefault();
					setItemFocused((current) => Math.max(current - 1, 0));
					break;
				}
				case "ArrowDown": {
					event.preventDefault();
					setItemFocused((current) =>
						Math.min(current + 1, filteredItemsCount - 1),
					);
					break;
				}
				case "Escape": {
					onClose();
					break;
				}
				default:
					break;
			}
		},
		[filteredItemsCount, onClose],
	);

	useEffect(() => {
		document.addEventListener("click", handleAllClick);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("click", handleAllClick);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleAllClick, handleKeyDown]);

	useEffect(() => {
		itemsContainerRef.current?.querySelectorAll("button")[itemFocused]?.focus();
	}, [itemFocused]);

	const [selectorButtonHeight, setSelectorButtonHeight] = useState(0);
	const [dropdownverticalPosition, setDropdownverticalPosition] =
		useState<string>();

	const inputRef = useRef<null | HTMLInputElement>(null);
	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		const selectorButton = document.getElementById(selectorId);
		const pageHeigth = window.innerHeight;
		const selectorButtonScrollY = selectorButton?.getBoundingClientRect().top;
		const size = Math.min(250, items.length * 32 + 16);

		if (
			(isTop(position) && (selectorButtonScrollY ?? 0) <= size + 15) ||
			(!isTop(position) &&
				pageHeigth -
					(selectorButtonScrollY ?? 0) -
					(selectorButton?.offsetHeight ?? 0) <=
					size + 15)
		) {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- position calculée depuis le DOM (bouton récupéré par id, pas par ref)
			setDropdownverticalPosition(isTop(position) ? "top" : "bottom");
		} else {
			setDropdownverticalPosition(isTop(position) ? "bottom" : "top");
		}

		setSelectorButtonHeight(selectorButton?.offsetHeight ?? 0);
	}, [items, position, selectorId]);

	return (
		<ul
			id={dropdownId}
			style={{
				[`${dropdownverticalPosition}`]: `${selectorButtonHeight + 5}px`,
				[isLeft(position) ? "right" : "left"]: 0,
			}}
			className={styles.dropdown}
		>
			{search ? (
				<input
					ref={inputRef}
					className={styles.dropdown_search_input}
					value={searchString}
					onChange={(event) => handleSearchChange(event.target.value)}
					onKeyDown={handleSearchKeyDown}
					placeholder={search.placeholder ?? DEFAULT_SEARCH_PLACEHOLDER}
				/>
			) : null}
			<div ref={itemsContainerRef}>
				{filteredItems.map((item, index) => (
					<button
						key={item.value || index}
						type="button"
						className={`${styles.select_item} ${selectedItem === item.value ? styles.selected_item : ""}`}
						onClick={() => selectItem(item.value)}
						value={item.value}
					>
						{item.label}
					</button>
				))}
			</div>
		</ul>
	);
}
