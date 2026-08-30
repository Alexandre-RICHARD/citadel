import React, { useState } from "react";

import type { DropdownPositionType } from "../../../types/react/dropdownPosition.type";
import type { SelectItemsType } from "../../../types/react/selectedItems.type";
import type { SelectSearchType } from "../../../types/react/selectSearch.type";
import { ButtonSelect } from "../ButtonSelect";
import { Dropdown } from "../Dropdown";
import styles from "./styles.module.scss";

type PropsType<T extends string> = {
	id: string;
	label: string | React.JSX.Element;
	items: SelectItemsType<T>[];
	selectedItem: T | undefined;
	position: DropdownPositionType;
	onSelect: (item: T | undefined) => void;
	search?: SelectSearchType;
};

export function Selector<T extends string>({
	id,
	label,
	items,
	selectedItem,
	position,
	onSelect,
	search,
}: PropsType<T>): React.JSX.Element {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const selectorId = `selector-${id}`;

	return (
		<div className={styles.selector}>
			<ButtonSelect
				selectorId={selectorId}
				label={label}
				onClick={() => setIsOpen(!isOpen)}
			/>
			{isOpen && (
				<Dropdown
					selectorId={selectorId}
					items={items}
					selectedItem={selectedItem}
					position={position}
					onSelect={onSelect}
					onClose={() => setIsOpen(false)}
					search={search}
				/>
			)}
		</div>
	);
}
