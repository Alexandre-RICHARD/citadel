import React, { useCallback, useEffect, useRef, useState } from "react";

import { stringSearcher } from "../../../helpers/data/string/stringSearcher.helper";
import type { DropdownPositionType } from "../../../types/react/dropdownPosition.type";
import type { SelectItemsType } from "../../../types/react/selectedItems.type";
import type { SelectSearchType } from "../../../types/react/selectSearch.type";
import styles from "./styles.module.scss";

const isTop = (position: string) => {
	return ["top-left", "top-right"].includes(position);
};

const isLeft = (position: string) => {
	return ["bottom-left", "top-left"].includes(position);
};

type PropsType<T extends string> = {
	selectorId: string;
	items: SelectItemsType<T>[];
	selectedItem?: T;
	position: DropdownPositionType;
	onSelect: (selectedItem: T) => void;
	onClose: () => void;
	search?: SelectSearchType;
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

	const handleChange = (event: React.MouseEvent<HTMLButtonElement>) => {
		onSelect(event.currentTarget.value as T);
		onClose();
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

	const setFocusOnItem = useCallback(() => {
		const allItems = document.querySelectorAll(".select_item");
		if (allItems[itemFocused]) {
			(allItems[itemFocused] as HTMLElement).focus();
		}
	}, [itemFocused]);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			switch (event.key) {
				case "ArrowUp": {
					if (itemFocused > 0) {
						setItemFocused(itemFocused - 1);
						setFocusOnItem();
					}
					break;
				}
				case "ArrowDown": {
					if (itemFocused < items.length - 1) {
						setItemFocused(itemFocused + 1);
						setFocusOnItem();
					}
					break;
				}
				case "Enter": {
					onSelect(items[itemFocused].value);
					break;
				}
				default:
					break;
			}
		},
		[items, itemFocused, onSelect, setFocusOnItem],
	);

	useEffect(() => {
		document.addEventListener("click", handleAllClick);
		document.addEventListener("keydown", handleKeyDown);
		setFocusOnItem();
		return () => {
			document.removeEventListener("click", handleAllClick);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [
		dropdownId,
		handleAllClick,
		handleKeyDown,
		onClose,
		selectorId,
		setFocusOnItem,
	]);

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
					onChange={(event) => setSearchString(event.target.value)}
					// TODO T => TRAD
					placeholder="Type to filter items"
				/>
			) : null}
			<div>
				{items
					.filter((item) =>
						stringSearcher({
							searchString,
							value: item.search,
							strictMode: search?.strictMode,
						}),
					)
					.map((item, index) => (
						<button
							key={item.value || index}
							type="button"
							className={`${styles.select_item} ${selectedItem === item.value ? styles.selected_item : ""}`}
							onClick={(event) => handleChange(event)}
							value={item.value}
						>
							{item.label}
						</button>
					))}
			</div>
		</ul>
	);
}
