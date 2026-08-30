import React from "react";

import { IconTokenEnum } from "../../../enums/iconToken.enum";
import { IconContainer } from "../IconContainer";
import styles from "./styles.module.scss";

type PropsType = {
	selectorId: string;
	label: string | React.JSX.Element;
	onClick: () => void;
};

export function ButtonSelect({
	selectorId,
	label,
	onClick,
}: PropsType): React.JSX.Element {
	return (
		<button
			id={selectorId}
			type="button"
			className={styles.button_select}
			onClick={onClick}
		>
			<div className={styles.selector_content}>
				{label}
				<IconContainer
					iconToken={IconTokenEnum.DropdownArrow}
					size={15}
					color="#ffffff"
				/>
			</div>
		</button>
	);
}
