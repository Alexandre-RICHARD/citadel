import type React from "react";
import { useState } from "react";

import { ButtonSelect } from "../../molecules/ButtonSelect";
import { Dropdown } from "../../molecules/Dropdown";
import type { DropdownPositionType } from "../../molecules/Dropdown/dropdownPosition.type";
import type { SelectItemsType } from "../../molecules/Dropdown/selectedItems.type";
import type { SelectSearchType } from "../../molecules/Dropdown/selectSearch.type";
import styles from "./selector.module.scss";

type PropsType<T extends string> = {
	id: string;
	label: string | React.JSX.Element;
	items: SelectItemsType<T>[];
	selectedItem: T | undefined;
	position: DropdownPositionType;
	onSelect: (item: T | undefined) => void;
	search?: SelectSearchType | undefined;
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
